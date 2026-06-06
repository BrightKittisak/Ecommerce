import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  getStripePublicConfigErrorMessage,
  STRIPE_PUBLIC_CONFIG_ERROR_MESSAGE,
} from '../lib/stripe-config-copy'

test('uses a safe Stripe public configuration error message', () => {
  const message = getStripePublicConfigErrorMessage()

  assert.equal(message, STRIPE_PUBLIC_CONFIG_ERROR_MESSAGE)
  assert.equal(message.includes('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'), false)
  assert.equal(message.includes('Missing environment variable'), false)
  assert.equal(message.includes('secret'), false)
})

test('does not throw raw Stripe public environment variable names', () => {
  const source = readFileSync('app/checkout/[id]/payment-form.tsx', 'utf8')

  assert.equal(source.includes('Missing environment variable'), false)
  assert.equal(source.includes('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"'), false)
  assert.equal(source.includes('getStripePublicConfigErrorMessage()'), true)
})
