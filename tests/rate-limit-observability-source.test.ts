import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const authSource = readFileSync('auth.ts', 'utf8')
const registrationSource = readFileSync('lib/actions/user.actions.ts', 'utf8')
const browsingSource = readFileSync(
  'app/api/products/browsing-history/route.ts',
  'utf8'
)

test('emits operation-specific events when auth and API limits block requests', () => {
  assert.equal(authSource.includes("logger.warn('auth.sign_in_rate_limited'"), true)
  assert.equal(
    registrationSource.includes("'auth.registration_rate_limited'"),
    true
  )
  assert.equal(
    browsingSource.includes("'api.browsing_history_rate_limited'"),
    true
  )
})

test('rate-limit log calls do not include raw request identities', () => {
  const loggingSources = `${authSource}\n${registrationSource}\n${browsingSource}`

  assert.equal(loggingSources.includes('logger.warn(email'), false)
  assert.equal(loggingSources.includes('logger.warn(request'), false)
  assert.equal(loggingSources.includes('logger.warn(rateLimitKeys'), false)
})
