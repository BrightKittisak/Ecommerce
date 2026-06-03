import assert from 'node:assert/strict'
import test from 'node:test'

import {
  approvePayPalPaymentOrder,
  createPayPalPaymentOrder,
  type PayPalPaymentOrder,
} from '../lib/application/orders/process-paypal-payment'
import type { PayPalCaptureLike } from '../lib/paypal-capture-verification'

const captureData: PayPalCaptureLike = {
  id: 'paypal-order-1',
  status: 'COMPLETED',
  payer: {
    email_address: 'buyer@example.com',
  },
  purchase_units: [
    {
      payments: {
        captures: [
          {
            id: 'capture-1',
            status: 'COMPLETED',
            amount: {
              currency_code: 'THB',
              value: '120.50',
            },
          },
        ],
      },
    },
  ],
}

const createOrder = (
  overrides: Partial<PayPalPaymentOrder> = {}
): PayPalPaymentOrder => ({
  totalPrice: 120.5,
  isPaid: false,
  paymentResult: {
    id: 'paypal-order-1',
    status: '',
    email_address: '',
    pricePaid: '0',
  },
  items: [],
  save: async () => undefined,
  populate: async () => undefined,
  ...overrides,
})

const createDeps = () => ({
  createPaymentOrder: async () => ({ id: 'paypal-order-1' }),
  capturePayment: async () => captureData,
  verifyCapture: () => ({
    captureId: 'capture-1',
    status: 'COMPLETED',
    payerEmail: 'buyer@example.com',
    pricePaid: '120.50',
  }),
  incrementSales: async () => undefined,
  sendReceipt: async () => undefined,
})

test('creates a PayPal payment order and stores its id on the order', async () => {
  let saved = false
  const order = createOrder({
    paymentResult: undefined,
    save: async () => {
      saved = true
    },
  })

  const result = await createPayPalPaymentOrder({
    order,
    deps: createDeps(),
  })

  assert.equal(saved, true)
  assert.equal(order.paymentResult?.id, 'paypal-order-1')
  assert.deepEqual(result, {
    status: 'created',
    paypalOrderId: 'paypal-order-1',
  })
})

test('does not create a duplicate PayPal order for an already paid order', async () => {
  let created = false

  const result = await createPayPalPaymentOrder({
    order: createOrder({ isPaid: true }),
    deps: {
      ...createDeps(),
      createPaymentOrder: async () => {
        created = true
        return { id: 'paypal-order-1' }
      },
    },
  })

  assert.equal(created, false)
  assert.deepEqual(result, {
    status: 'already_processed',
  })
})

test('rejects PayPal approval when the browser order id does not match', async () => {
  await assert.rejects(
    approvePayPalPaymentOrder({
      order: createOrder(),
      paypalOrderId: 'different-paypal-order',
      deps: createDeps(),
    }),
    /ไม่ตรงกับคำสั่งซื้อนี้/
  )
})

test('marks a verified PayPal payment as paid', async () => {
  let populated = false
  let saved = false
  let salesIncremented = false
  let receiptSent = false
  const order = createOrder({
    populate: async () => {
      populated = true
    },
    save: async () => {
      saved = true
    },
  })

  const result = await approvePayPalPaymentOrder({
    order,
    paypalOrderId: 'paypal-order-1',
    deps: {
      ...createDeps(),
      incrementSales: async () => {
        salesIncremented = true
      },
      sendReceipt: async () => {
        receiptSent = true
      },
    },
  })

  assert.equal(order.isPaid, true)
  assert.ok(order.paidAt instanceof Date)
  assert.equal(order.paymentResult?.id, 'capture-1')
  assert.equal(order.paymentResult?.status, 'COMPLETED')
  assert.equal(order.paymentResult?.email_address, 'buyer@example.com')
  assert.equal(order.paymentResult?.pricePaid, '120.50')
  assert.equal(populated, true)
  assert.equal(saved, true)
  assert.equal(salesIncremented, true)
  assert.equal(receiptSent, true)
  assert.deepEqual(result, {
    status: 'completed',
  })
})
