import assert from 'node:assert/strict'
import test from 'node:test'

import {
  processStripeWebhookPayment,
  type StripeWebhookOrder,
} from '../lib/application/orders/process-stripe-webhook-payment'
import type { StripePaymentIntentLike } from '../lib/stripe-payment-verification'

const paymentIntent: StripePaymentIntentLike = {
  id: 'pi_123',
  status: 'succeeded',
  created: 1_780_000_000,
  amount_received: 12050,
  currency: 'thb',
  receipt_email: 'buyer@example.com',
  metadata: {
    orderId: 'order_123',
  },
}

const createOrder = (
  overrides: Partial<StripeWebhookOrder> = {}
): StripeWebhookOrder => ({
  _id: {
    toString: () => 'order_123',
  },
  totalPrice: 120.5,
  currencyCode: 'THB',
  isPaid: false,
  items: [],
  save: async () => undefined,
  ...overrides,
})

const createDeps = (order: StripeWebhookOrder | null) => ({
  findOrderById: async () => order,
  incrementSales: async () => undefined,
  sendReceipt: async () => undefined,
  logReceiptError: () => undefined,
})

test('returns missing_order_id when Stripe metadata has no order id', async () => {
  const result = await processStripeWebhookPayment({
    paymentIntent: {
      ...paymentIntent,
      metadata: {},
    },
    deps: createDeps(null),
  })

  assert.deepEqual(result, {
    status: 'missing_order_id',
    message: 'Missing orderId in Stripe event metadata',
  })
})

test('returns order_not_found when the referenced order is missing', async () => {
  const result = await processStripeWebhookPayment({
    paymentIntent,
    deps: createDeps(null),
  })

  assert.deepEqual(result, {
    status: 'order_not_found',
    message: 'Order not found for this Stripe event',
  })
})

test('returns already_processed without saving an already paid order', async () => {
  let saved = false
  const result = await processStripeWebhookPayment({
    paymentIntent,
    deps: createDeps(
      createOrder({
        isPaid: true,
        save: async () => {
          saved = true
        },
      })
    ),
  })

  assert.equal(saved, false)
  assert.deepEqual(result, {
    status: 'already_processed',
    message: 'Order payment already processed',
  })
})

test('marks a valid Stripe webhook payment as paid', async () => {
  let salesIncremented = false
  let receiptSent = false
  const order = createOrder()

  const result = await processStripeWebhookPayment({
    paymentIntent,
    deps: {
      findOrderById: async () => order,
      incrementSales: async () => {
        salesIncremented = true
      },
      sendReceipt: async () => {
        receiptSent = true
      },
      logReceiptError: () => undefined,
    },
  })

  assert.equal(order.isPaid, true)
  assert.equal(order.paymentResult?.id, 'pi_123')
  assert.equal(order.paymentResult?.status, 'SUCCEEDED')
  assert.equal(order.paymentResult?.email_address, 'buyer@example.com')
  assert.equal(order.paymentResult?.pricePaid, '120.50')
  assert.equal(salesIncremented, true)
  assert.equal(receiptSent, true)
  assert.deepEqual(result, {
    status: 'completed',
    message: 'Order payment marked as completed',
  })
})
