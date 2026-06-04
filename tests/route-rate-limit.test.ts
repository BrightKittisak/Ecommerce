import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createRateLimitedResponse,
  getRateLimitHeaders,
  getRouteRateLimitIdentity,
  ROUTE_RATE_LIMIT_POLICIES,
} from '../lib/route-rate-limit'

test('declares route rate-limit policies for browser-facing APIs', () => {
  assert.deepEqual(ROUTE_RATE_LIMIT_POLICIES.catalogCategories, {
    route: 'api:catalog-categories',
    limit: 120,
    windowMs: 60_000,
  })
  assert.deepEqual(ROUTE_RATE_LIMIT_POLICIES.browsingHistoryProducts, {
    route: 'api:browsing-history-products',
    limit: 60,
    windowMs: 60_000,
  })
})

test('uses forwarded client ip as the route rate-limit identity', () => {
  const request = new Request('https://example.test/api/catalog/categories', {
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

test('creates a 429 response with retry headers', async () => {
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
