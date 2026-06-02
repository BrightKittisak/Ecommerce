import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getPayPalApiBaseUrl,
  getPayPalAppSecret,
  getPayPalClientId,
} from '../lib/paypal-config'

test('reads required PayPal configuration values', () => {
  const env = {
    PAYPAL_API_URL: 'https://api-m.paypal.com',
    PAYPAL_CLIENT_ID: 'client-id',
    PAYPAL_APP_SECRET: 'app-secret',
  }

  assert.equal(getPayPalApiBaseUrl(env), 'https://api-m.paypal.com')
  assert.equal(getPayPalClientId(env), 'client-id')
  assert.equal(getPayPalAppSecret(env), 'app-secret')
})

test('rejects missing PayPal configuration values', () => {
  assert.throws(() => getPayPalApiBaseUrl({}), /PAYPAL_API_URL/)
  assert.throws(() => getPayPalClientId({}), /PAYPAL_CLIENT_ID/)
  assert.throws(() => getPayPalAppSecret({}), /PAYPAL_APP_SECRET/)
})
