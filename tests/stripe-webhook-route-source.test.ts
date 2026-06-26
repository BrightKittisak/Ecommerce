import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync('app/api/webhooks/stripe/route.tsx', 'utf8')

test('Stripe webhook route does not expose missing-signature details', () => {
  assert.equal(source.includes('Missing Stripe signature header'), false)
  assert.equal(source.includes('getStripeWebhookMissingSignatureResponse()'), true)
})
