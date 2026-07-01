import assert from 'node:assert/strict'
import test from 'node:test'

import {
  AuthRateLimitError,
  getClientIp,
  getSignInRateLimitKeys,
} from '../lib/auth-rate-limit'
import { getClientIpFromHeaders } from '../lib/request-ip'

test('reads the first forwarded client ip', () => {
  const request = new Request('https://example.test', {
    headers: {
      'x-forwarded-for': '203.0.113.1, 203.0.113.2',
    },
  })

  assert.equal(getClientIp(request), '203.0.113.1')
  assert.equal(getClientIpFromHeaders(request.headers), '203.0.113.1')
})

test('builds hashed sign-in rate limit keys without exposing raw identifiers', () => {
  const request = new Request('https://example.test', {
    headers: {
      'x-real-ip': '203.0.113.10',
    },
  })

  const keys = getSignInRateLimitKeys({
    email: ' Buyer@Example.COM ',
    request,
  })

  assert.equal(keys.length, 2)
  assert.deepEqual(
    keys.map((key) => key.scope),
    ['email', 'ip']
  )
  assert.equal(keys.every((key) => key.key.includes('@') === false), true)
  assert.equal(keys.every((key) => key.key.includes('203.0.113') === false), true)
})

test('uses a stable auth rate-limit error name', () => {
  const error = new AuthRateLimitError()

  assert.equal(error.name, 'AuthRateLimitError')
})
