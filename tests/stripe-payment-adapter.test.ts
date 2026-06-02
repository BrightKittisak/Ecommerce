import assert from 'node:assert/strict'
import test from 'node:test'

import { buildStripeCheckoutPaymentIntentParams } from '../lib/infrastructure/payments/stripe-payment-adapter'

test('builds Stripe checkout payment intent params from order facts', () => {
  assert.deepEqual(
    buildStripeCheckoutPaymentIntentParams({
      orderId: 'order-1',
      totalPrice: 120.555,
      currencyCode: 'THB',
    }),
    {
      amount: 12056,
      currency: 'thb',
      metadata: {
        orderId: 'order-1',
      },
    }
  )
})
