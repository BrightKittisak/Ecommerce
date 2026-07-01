import { createHash } from 'crypto'

import { NextResponse } from 'next/server'

import { routeRateLimitDeps } from './infrastructure/rate-limit/route-rate-limit-deps'
import { RATE_LIMITED_MESSAGE } from './rate-limit-error'
import { getClientIp } from './request-ip'

export type RouteRateLimitPolicy = {
  route: string
  limit: number
  windowMs: number
}

export type RouteRateLimitRecord = {
  count: number
  windowStartedAt: Date
}

export type RouteRateLimitPersistenceDeps = {
  updateRouteRateLimitRecord(input: {
    expiresAt: Date
    key: string
    now: Date
    policy: RouteRateLimitPolicy
    windowStartedAfter: Date
  }): Promise<RouteRateLimitRecord | null>
}

type MongoDuplicateKeyError = {
  code?: unknown
}

export const ROUTE_RATE_LIMIT_POLICIES = {
  browsingHistoryProducts: {
    route: 'api:browsing-history-products',
    limit: 60,
    windowMs: 60 * 1000,
  },
  userRegistration: {
    route: 'action:user-registration',
    limit: 10,
    windowMs: 15 * 60 * 1000,
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

export const isMongoDuplicateKeyError = (
  error: unknown
): error is MongoDuplicateKeyError =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as MongoDuplicateKeyError).code === 11000

export const getRouteRateLimitIdentity = (request: Request) =>
  getClientIp(request)

export const assertRouteRateLimitForIdentity = async ({
  deps = routeRateLimitDeps,
  identity,
  now = new Date(),
  policy,
}: {
  deps?: RouteRateLimitPersistenceDeps
  identity: string
  now?: Date
  policy: RouteRateLimitPolicy
}): Promise<RouteRateLimitDecision> => {
  const windowStartedAfter = new Date(now.getTime() - policy.windowMs)
  const expiresAt = new Date(now.getTime() + policy.windowMs)
  const key = hashRouteRateLimitKey({
    identifier: identity,
    route: policy.route,
  })

  let record: RouteRateLimitRecord | null

  try {
    record = await deps.updateRouteRateLimitRecord({
      expiresAt,
      key,
      now,
      policy,
      windowStartedAfter,
    })
  } catch (error) {
    if (!isMongoDuplicateKeyError(error)) throw error

    record = await deps.updateRouteRateLimitRecord({
      expiresAt,
      key,
      now,
      policy,
      windowStartedAfter,
    })
  }

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

export const assertRouteRateLimit = ({
  deps,
  policy,
  request,
}: {
  deps?: RouteRateLimitPersistenceDeps
  policy: RouteRateLimitPolicy
  request: Request
}) =>
  assertRouteRateLimitForIdentity({
    deps,
    identity: getRouteRateLimitIdentity(request),
    policy,
  })

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
    { message: RATE_LIMITED_MESSAGE },
    {
      status: 429,
      headers: {
        ...getRateLimitHeaders(decision),
        'Retry-After': String(decision.retryAfterSeconds),
      },
    }
  )
