import assert from 'node:assert/strict'
import test from 'node:test'

import {
  assertRouteRateLimit,
  assertRouteRateLimitForIdentity,
  createRateLimitedResponse,
  getRateLimitHeaders,
  getRateLimitLogMetadata,
  getRouteRateLimitIdentity,
  isMongoDuplicateKeyError,
  ROUTE_RATE_LIMIT_POLICIES,
  type RouteRateLimitPersistenceDeps,
} from '../lib/route-rate-limit'

test('declares rate-limit policies for expensive non-cacheable operations', () => {
  assert.equal('catalogCategories' in ROUTE_RATE_LIMIT_POLICIES, false)
  assert.deepEqual(ROUTE_RATE_LIMIT_POLICIES.browsingHistoryProducts, {
    route: 'api:browsing-history-products',
    limit: 60,
    windowMs: 60_000,
  })
  assert.deepEqual(ROUTE_RATE_LIMIT_POLICIES.userRegistration, {
    route: 'action:user-registration',
    limit: 10,
    windowMs: 15 * 60_000,
  })
})

test('uses forwarded client ip as the route rate-limit identity', () => {
  const request = new Request('https://example.test/api/products/browsing-history', {
    headers: {
      'x-forwarded-for': '203.0.113.5, 203.0.113.6',
    },
  })

  assert.equal(getRouteRateLimitIdentity(request), '203.0.113.5')
})

test('formats rate-limit headers from a decision', () => {
  const resetAt = new Date('2026-06-04T05:00:30.000Z')

  assert.deepEqual(
    getRateLimitHeaders({
      allowed: true,
      limit: 120,
      remaining: 119,
      resetAt,
      retryAfterSeconds: 30,
    }),
    {
      RateLimit: 'limit=120, remaining=119, reset=1780549230',
      'RateLimit-Limit': '120',
      'RateLimit-Remaining': '119',
      'RateLimit-Reset': '1780549230',
    }
  )
})

test('builds rate-limit log metadata without request identities', () => {
  const metadata = getRateLimitLogMetadata(
    ROUTE_RATE_LIMIT_POLICIES.userRegistration,
    {
      allowed: false,
      limit: 10,
      remaining: 0,
      resetAt: new Date('2026-07-01T00:15:00.000Z'),
      retryAfterSeconds: 120,
    }
  )

  assert.deepEqual(metadata, {
    operation: 'action:user-registration',
    limit: 10,
    retryAfterSeconds: 120,
  })
  assert.equal('identity' in metadata, false)
  assert.equal('key' in metadata, false)
})

test('creates a 429 response with retry headers and Thai copy', async () => {
  const response = createRateLimitedResponse({
    allowed: false,
    limit: 60,
    remaining: 0,
    resetAt: new Date('2026-06-04T05:00:30.000Z'),
    retryAfterSeconds: 12,
  })

  assert.equal(response.status, 429)
  assert.equal(response.headers.get('Retry-After'), '12')
  assert.equal(response.headers.get('RateLimit-Limit'), '60')
  assert.deepEqual(await response.json(), {
    message: 'ส่งคำขอมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง',
  })
})

test('detects Mongo duplicate-key errors for concurrent limiter upserts', () => {
  assert.equal(isMongoDuplicateKeyError({ code: 11000 }), true)
  assert.equal(isMongoDuplicateKeyError({ code: '11000' }), false)
  assert.equal(isMongoDuplicateKeyError(new Error('boom')), false)
  assert.equal(isMongoDuplicateKeyError(null), false)
})

test('retries once when a concurrent limiter upsert hits a duplicate key', async () => {
  const request = new Request('https://example.test/api/products/browsing-history', {
    headers: {
      'x-forwarded-for': '203.0.113.5',
    },
  })
  let attempts = 0
  const deps: RouteRateLimitPersistenceDeps = {
    async updateRouteRateLimitRecord() {
      attempts += 1
      if (attempts === 1) throw { code: 11000 }

      return {
        count: 2,
        windowStartedAt: new Date(),
      }
    },
  }

  const decision = await assertRouteRateLimit({
    deps,
    policy: ROUTE_RATE_LIMIT_POLICIES.browsingHistoryProducts,
    request,
  })

  assert.equal(attempts, 2)
  assert.equal(decision.allowed, true)
  assert.equal(decision.remaining, 58)
})

test('hashes direct identities for server-action rate limits', async () => {
  let storedKey = ''
  const deps: RouteRateLimitPersistenceDeps = {
    async updateRouteRateLimitRecord(input) {
      storedKey = input.key
      return {
        count: 1,
        windowStartedAt: input.now,
      }
    },
  }

  const decision = await assertRouteRateLimitForIdentity({
    deps,
    identity: '203.0.113.25',
    now: new Date('2026-07-01T00:00:00.000Z'),
    policy: ROUTE_RATE_LIMIT_POLICIES.userRegistration,
  })

  assert.equal(decision.allowed, true)
  assert.equal(decision.remaining, 9)
  assert.equal(storedKey.startsWith('action:user-registration:'), true)
  assert.equal(storedKey.includes('203.0.113.25'), false)
})
