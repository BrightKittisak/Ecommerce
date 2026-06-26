import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getStripeWebhookInvalidSignatureResponse,
  getStripeWebhookMissingSignatureResponse,
  getStripeWebhookSignatureLogMetadata,
  STRIPE_WEBHOOK_INVALID_SIGNATURE_MESSAGE,
} from '../lib/stripe-webhook-response'

test('returns a generic Stripe webhook signature error to callers', () => {
  const response = getStripeWebhookInvalidSignatureResponse()

  assert.deepEqual(response, {
    message: STRIPE_WEBHOOK_INVALID_SIGNATURE_MESSAGE,
  })
  assert.equal(response.message.includes('No signatures found'), false)
})

test('returns the same generic response when the Stripe signature is missing', () => {
  assert.deepEqual(
    getStripeWebhookMissingSignatureResponse(),
    getStripeWebhookInvalidSignatureResponse()
  )
})

test('keeps Stripe webhook signature details in structured logs only', () => {
  assert.deepEqual(
    getStripeWebhookSignatureLogMetadata(
      new Error('No signatures found matching the expected signature')
    ),
    {
      error: {
        name: 'Error',
        message: 'No signatures found matching the expected signature',
      },
    }
  )
})
