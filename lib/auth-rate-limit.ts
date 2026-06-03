import { createHash } from 'crypto'

import AuthRateLimit from './db/models/auth-rate-limit.model'

const MAX_FAILED_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000
const BLOCK_MS = 15 * 60 * 1000

type RateLimitScope = 'email' | 'ip'

type RateLimitKey = {
  key: string
  scope: RateLimitScope
}

export class AuthRateLimitError extends Error {
  constructor() {
    super('พยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณาลองใหม่อีกครั้งภายหลัง')
    this.name = 'AuthRateLimitError'
  }
}

const hashRateLimitValue = (scope: RateLimitScope, value: string) =>
  `${scope}:${createHash('sha256').update(value).digest('hex')}`

export const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim()

  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export const getSignInRateLimitKeys = ({
  email,
  request,
}: {
  email?: string
  request: Request
}): RateLimitKey[] => {
  const keys: RateLimitKey[] = []
  const normalizedEmail = email?.trim().toLowerCase()
  const clientIp = getClientIp(request)

  if (normalizedEmail) {
    keys.push({
      key: hashRateLimitValue('email', normalizedEmail),
      scope: 'email',
    })
  }

  if (clientIp) {
    keys.push({
      key: hashRateLimitValue('ip', clientIp),
      scope: 'ip',
    })
  }

  return keys
}

export const assertSignInAllowed = async (keys: RateLimitKey[]) => {
  if (keys.length === 0) return

  const now = new Date()
  const blockedRecord = await AuthRateLimit.findOne({
    key: { $in: keys.map((item) => item.key) },
    blockedUntil: { $gt: now },
  }).lean()

  if (blockedRecord) {
    throw new AuthRateLimitError()
  }
}

export const recordFailedSignIn = async (keys: RateLimitKey[]) => {
  if (keys.length === 0) return

  const now = new Date()
  const windowStartedAfter = new Date(now.getTime() - WINDOW_MS)
  const blockedUntil = new Date(now.getTime() + BLOCK_MS)

  await Promise.all(
    keys.map(async ({ key, scope }) => {
      await AuthRateLimit.findOneAndUpdate(
        { key },
        [
          {
            $set: {
              key,
              scope,
              shouldResetWindow: {
                $lt: [
                  { $ifNull: ['$firstAttemptAt', new Date(0)] },
                  windowStartedAfter,
                ],
              },
            },
          },
          {
            $set: {
              attempts: {
                $cond: [
                  '$shouldResetWindow',
                  1,
                  { $add: [{ $ifNull: ['$attempts', 0] }, 1] },
                ],
              },
              firstAttemptAt: {
                $cond: ['$shouldResetWindow', now, '$firstAttemptAt'],
              },
              lastAttemptAt: now,
              createdAt: { $ifNull: ['$createdAt', now] },
              updatedAt: now,
            },
          },
          {
            $set: {
              blockedUntil: {
                $cond: [
                  { $gte: ['$attempts', MAX_FAILED_ATTEMPTS] },
                  blockedUntil,
                  '$$REMOVE',
                ],
              },
            },
          },
          { $unset: 'shouldResetWindow' },
        ],
        { upsert: true }
      )
    })
  )
}

export const clearSignInFailures = async (keys: RateLimitKey[]) => {
  if (keys.length === 0) return

  await AuthRateLimit.deleteMany({
    key: { $in: keys.map((item) => item.key) },
  })
}
