import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync('app/api/webhooks/stripe/route.tsx', 'utf8')

test('Stripe webhook route does not expose missing-signature details', () => {
  assert.equal(source.includes('Missing Stripe signature header'), false)
  assert.equal(source.includes('getStripeWebhookMissingSignatureResponse()'), true)
})

test('Stripe webhook route rejects unsigned and oversized bodies before verification', () => {
  const signatureCheck = source.indexOf("req.headers.get('stripe-signature')")
  const bodyRead = source.indexOf('readRequestTextWithLimit(')
  const eventVerification = source.indexOf('constructStripeWebhookEvent({')

  assert.equal(source.includes('await req.text()'), false)
  assert.equal(source.includes('STRIPE_WEBHOOK_MAX_BODY_BYTES'), true)
  assert.equal(source.includes('{ status: 413 }'), true)
  assert.equal(signatureCheck < bodyRead, true)
  assert.equal(bodyRead < eventVerification, true)
})
