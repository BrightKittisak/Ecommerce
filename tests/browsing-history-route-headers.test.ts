import assert from 'node:assert/strict'
import test from 'node:test'

import { getBrowsingHistoryHeaders } from '../lib/browsing-history-response-headers'

test('marks browsing-history API responses as private and non-cacheable', () => {
  const headers = getBrowsingHistoryHeaders({
    allowed: true,
    limit: 60,
    remaining: 59,
    resetAt: new Date('2026-06-04T05:00:30.000Z'),
    retryAfterSeconds: 30,
  })

  assert.equal(headers['Cache-Control'], 'private, no-store')
  assert.equal(headers['RateLimit-Limit'], '60')
  assert.equal(headers['RateLimit-Remaining'], '59')
})
