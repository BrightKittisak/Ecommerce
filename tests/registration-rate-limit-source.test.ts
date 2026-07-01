import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync('lib/actions/user.actions.ts', 'utf8')

test('rate limits registration before validation, hashing, and persistence', () => {
  const rateLimit = source.indexOf('assertRouteRateLimitForIdentity({')
  const registration = source.indexOf('await registerUserAccount({')

  assert.equal(source.includes('ROUTE_RATE_LIMIT_POLICIES.userRegistration'), true)
  assert.equal(source.includes('getClientIpFromHeaders(requestHeaders)'), true)
  assert.equal(rateLimit >= 0, true)
  assert.equal(rateLimit < registration, true)
})
