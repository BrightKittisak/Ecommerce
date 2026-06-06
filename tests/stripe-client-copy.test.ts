import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  getStripeClientErrorMessage,
  STRIPE_CLIENT_ERROR_MESSAGE,
} from '../lib/stripe-client-copy'

test('uses a safe localized Stripe client error message', () => {
  const message = getStripeClientErrorMessage()

  assert.equal(message, STRIPE_CLIENT_ERROR_MESSAGE)
  assert.equal(message.includes('Your card'), false)
  assert.equal(message.includes('debug_id'), false)
  assert.equal(message.includes('secret'), false)
})

test('does not render raw Stripe client error messages', () => {
  const source = readFileSync('app/checkout/[id]/stripe-form.tsx', 'utf8')

  assert.equal(source.includes('setErrorMessage(error.message)'), false)
  assert.equal(source.includes('getStripeClientErrorMessage()'), true)
})
