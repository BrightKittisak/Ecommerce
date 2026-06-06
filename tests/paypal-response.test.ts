import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createPayPalApiError,
  getPayPalApiErrorLogMetadata,
  PAYPAL_API_ERROR_MESSAGE,
} from '../lib/paypal-response'

test('returns a generic PayPal API error to callers', () => {
  const error = createPayPalApiError()

  assert.equal(error.message, PAYPAL_API_ERROR_MESSAGE)
  assert.equal(error.message.includes('debug_id'), false)
  assert.equal(error.message.includes('INSTRUMENT_DECLINED'), false)
})

test('keeps PayPal upstream response details in structured logs only', () => {
  assert.deepEqual(
    getPayPalApiErrorLogMetadata({
      status: 422,
      statusText: 'Unprocessable Entity',
      body: '{"name":"INSTRUMENT_DECLINED","debug_id":"abc123"}',
    }),
    {
      status: 422,
      statusText: 'Unprocessable Entity',
      body: '{"name":"INSTRUMENT_DECLINED","debug_id":"abc123"}',
    }
  )
})
