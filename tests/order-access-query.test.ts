import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getOrderDTOById,
  getOrderDTOForUser,
  getOrderOwnerId,
  requireOrderForUser,
} from '../lib/application/orders/order-access-query'

const idLike = (value: string) => ({
  toString: () => value,
})

const shippingAddress = {
  fullName: 'Buyer Example',
  street: '123 Test Street',
  city: 'Bangkok',
  province: 'Bangkok',
  postalCode: '10110',
  country: 'Thailand',
  phone: '0812345678',
}

const orderRecord = (overrides = {}) => ({
  _id: idLike('order-1'),
  user: 'user-1',
  items: [],
  shippingAddress,
  paymentMethod: 'PayPal',
  itemsPrice: 100,
  shippingPrice: 10,
  taxPrice: 7,
  totalPrice: 117,
  currencyCode: 'THB',
  expectedDeliveryDate: new Date('2026-01-10T00:00:00.000Z'),
  isDelivered: false,
  isPaid: false,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  save: async () => {},
  populate: async () => {},
  ...overrides,
})

test('reads order owner ids from string, object id, and populated users', () => {
  assert.equal(getOrderOwnerId({ user: 'user-1' }), 'user-1')
  assert.equal(getOrderOwnerId({ user: idLike('user-2') }), 'user-2')
  assert.equal(
    getOrderOwnerId({ user: { _id: idLike('user-3'), email: 'u@example.com' } }),
    'user-3'
  )
})

test('returns an order DTO by id', async () => {
  const order = await getOrderDTOById({
    orderId: 'order-1',
    deps: {
      findOrderById: async () => orderRecord(),
    },
  })

  assert.equal(order?._id, 'order-1')
  assert.equal(order?.user, 'user-1')
  assert.equal(order?.createdAt, '2026-01-01T00:00:00.000Z')
})

test('returns null when an order is missing or belongs to another user', async () => {
  assert.equal(
    await getOrderDTOById({
      orderId: 'missing',
      deps: {
        findOrderById: async () => null,
      },
    }),
    null
  )

  assert.equal(
    await getOrderDTOForUser({
      orderId: 'order-1',
      userId: 'user-2',
      isAdmin: false,
      deps: {
        findOrderById: async () => orderRecord(),
      },
    }),
    null
  )
})

test('requires ownership for non-admin order access', async () => {
  const order = await requireOrderForUser({
    orderId: 'order-1',
    userId: 'user-1',
    isAdmin: false,
    deps: {
      findOrderById: async () => orderRecord(),
    },
  })

  assert.equal(order._id.toString(), 'order-1')

  await assert.rejects(
    requireOrderForUser({
      orderId: 'order-1',
      userId: 'user-2',
      isAdmin: false,
      deps: {
        findOrderById: async () => orderRecord(),
      },
    }),
    /ไม่พบคำสั่งซื้อ/
  )
})

test('allows admin order access across owners', async () => {
  const order = await requireOrderForUser({
    orderId: 'order-1',
    userId: 'admin-1',
    isAdmin: true,
    deps: {
      findOrderById: async () => orderRecord(),
    },
  })

  assert.equal(order._id.toString(), 'order-1')
})
