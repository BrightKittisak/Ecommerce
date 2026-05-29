import assert from 'node:assert/strict'
import test from 'node:test'

import {
  formatStripeAmountInCents,
  verifyStripePaymentIntent,
} from '../lib/stripe-payment-verification'

const validPaymentIntent = {
  id: 'pi_123',
  status: 'succeeded',
  amount: 12050,
  amount_received: 12050,
  currency: 'thb',
  receipt_email: 'buyer@example.com',
  metadata: {
    orderId: 'order_123',
  },
}

test('formats Stripe amounts in cents', () => {
  assert.equal(formatStripeAmountInCents(120), 12000)
  assert.equal(formatStripeAmountInCents(120.5), 12050)
  assert.equal(formatStripeAmountInCents(120.555), 12056)
})

test('accepts a succeeded Stripe payment intent that matches the order facts', () => {
  const verifiedPayment = verifyStripePaymentIntent({
    paymentIntent: validPaymentIntent,
    expectedOrderId: 'order_123',
    expectedTotalPrice: 120.5,
    expectedCurrencyCode: 'THB',
    amountField: 'amount_received',
  })

  assert.deepEqual(verifiedPayment, {
    id: 'pi_123',
    status: 'SUCCEEDED',
    emailAddress: 'buyer@example.com',
    pricePaid: '120.50',
  })
})

test('rejects payment intents for a different order id', () => {
  assert.throws(
    () =>
      verifyStripePaymentIntent({
        paymentIntent: validPaymentIntent,
        expectedOrderId: 'order_456',
        expectedTotalPrice: 120.5,
        expectedCurrencyCode: 'THB',
        amountField: 'amount_received',
      }),
    /Invalid Stripe payment intent/
  )
})

test('rejects payment intents with a mismatched amount', () => {
  assert.throws(
    () =>
      verifyStripePaymentIntent({
        paymentIntent: validPaymentIntent,
        expectedOrderId: 'order_123',
        expectedTotalPrice: 121,
        expectedCurrencyCode: 'THB',
        amountField: 'amount_received',
      }),
    /Invalid Stripe payment intent/
  )
})

test('rejects payment intents with a mismatched currency', () => {
  assert.throws(
    () =>
      verifyStripePaymentIntent({
        paymentIntent: validPaymentIntent,
        expectedOrderId: 'order_123',
        expectedTotalPrice: 120.5,
        expectedCurrencyCode: 'USD',
        amountField: 'amount_received',
      }),
    /Invalid Stripe payment intent/
  )
})

test('rejects payment intents that have not succeeded', () => {
  assert.throws(
    () =>
      verifyStripePaymentIntent({
        paymentIntent: {
          ...validPaymentIntent,
          status: 'requires_payment_method',
        },
        expectedOrderId: 'order_123',
        expectedTotalPrice: 120.5,
        expectedCurrencyCode: 'THB',
        amountField: 'amount_received',
      }),
    /Invalid Stripe payment intent/
  )
})

test('supports success-page verification against the original amount field', () => {
  assert.doesNotThrow(() =>
    verifyStripePaymentIntent({
      paymentIntent: validPaymentIntent,
      expectedOrderId: 'order_123',
      expectedTotalPrice: 120.5,
      expectedCurrencyCode: 'THB',
      amountField: 'amount',
    })
  )
})

test('can verify success-page order facts before the payment has succeeded', () => {
  assert.doesNotThrow(() =>
    verifyStripePaymentIntent({
      paymentIntent: {
        ...validPaymentIntent,
        status: 'processing',
      },
      expectedOrderId: 'order_123',
      expectedTotalPrice: 120.5,
      expectedCurrencyCode: 'THB',
      amountField: 'amount',
      requireSucceeded: false,
    })
  )
})
