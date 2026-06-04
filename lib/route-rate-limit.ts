import { createHash } from 'crypto'

import { NextResponse } from 'next/server'

import { connectToDatabase } from './db'
import RouteRateLimit from './db/models/route-rate-limit.model'
import { getClientIp } from './request-ip'

type RouteRateLimitPolicy = {
  route: string
  limit: number
  windowMs: number
}

type RouteRateLimitRecord = {
  count: number
  windowStartedAt: Date
}

export const ROUTE_RATE_LIMIT_POLICIES = {
  browsingHistoryProducts: {
    route: 'api:browsing-history-products',
    limit: 60,
    windowMs: 60 * 1000,
  },
} as const satisfies Record<string, RouteRateLimitPolicy>

export type RouteRateLimitDecision = {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: Date
  retryAfterSeconds: number
}

const hashRouteRateLimitKey = ({
  identifier,
  route,
}: {
  identifier: string
  route: string
}) => `${route}:${createHash('sha256').update(identifier).digest('hex')}`

const getResetAt = (windowStartedAt: Date, windowMs: number) =>
  new Date(windowStartedAt.getTime() + windowMs)

export const getRouteRateLimitIdentity = (request: Request) =>
  getClientIp(request)

export const assertRouteRateLimit = async ({
  policy,
  request,
}: {
  policy: RouteRateLimitPolicy
  request: Request
}): Promise<RouteRateLimitDecision> => {
  const now = new Date()
  const windowStartedAfter = new Date(now.getTime() - policy.windowMs)
  const expiresAt = new Date(now.getTime() + policy.windowMs)
  const identity = getRouteRateLimitIdentity(request)
  const key = hashRouteRateLimitKey({
    identifier: identity,
    route: policy.route,
  })

  await connectToDatabase()

  const record = await RouteRateLimit.findOneAndUpdate(
    { key },
    [
      {
        $set: {
          key,
          route: policy.route,
          shouldResetWindow: {
            $lt: [
              { $ifNull: ['$windowStartedAt', new Date(0)] },
              windowStartedAfter,
            ],
          },
        },
      },
      {
        $set: {
          count: {
            $cond: [
              '$shouldResetWindow',
              1,
              { $add: [{ $ifNull: ['$count', 0] }, 1] },
            ],
          },
          windowStartedAt: {
            $cond: ['$shouldResetWindow', now, '$windowStartedAt'],
          },
          expiresAt,
          createdAt: { $ifNull: ['$createdAt', now] },
          updatedAt: now,
        },
      },
      { $unset: 'shouldResetWindow' },
    ],
    { upsert: true, new: true }
  )
    .select({ count: 1, windowStartedAt: 1 })
    .lean<RouteRateLimitRecord>()

  const count = record?.count ?? 1
  const resetAt = getResetAt(record?.windowStartedAt ?? now, policy.windowMs)
  const remaining = Math.max(policy.limit - count, 0)
  const retryAfterSeconds = Math.max(
    Math.ceil((resetAt.getTime() - now.getTime()) / 1000),
    1
  )

  return {
    allowed: count <= policy.limit,
    limit: policy.limit,
    remaining,
    resetAt,
    retryAfterSeconds,
  }
}

export const getRateLimitHeaders = (decision: RouteRateLimitDecision) => ({
  RateLimit: `limit=${decision.limit}, remaining=${decision.remaining}, reset=${Math.ceil(
    decision.resetAt.getTime() / 1000
  )}`,
  'RateLimit-Limit': String(decision.limit),
  'RateLimit-Remaining': String(decision.remaining),
  'RateLimit-Reset': String(Math.ceil(decision.resetAt.getTime() / 1000)),
})

export const createRateLimitedResponse = (decision: RouteRateLimitDecision) =>
  NextResponse.json(
    { message: 'ส่งคำขอมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง' },
    {
      status: 429,
      headers: {
        ...getRateLimitHeaders(decision),
        'Retry-After': String(decision.retryAfterSeconds),
      },
    }
  )
