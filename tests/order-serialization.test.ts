import assert from 'node:assert/strict'
import test from 'node:test'

import { toOrderDTO } from '../lib/application/orders/serializers'

const idLike = (value: string) => ({
  toString: () => value,
})

const orderItem = {
  clientId: 'cart-item-1',
  product: 'product-1',
  name: 'Studio Bag',
  slug: 'studio-bag',
  category: 'bags',
  quantity: 2,
  countInStock: 8,
  image: '/images/studio-bag.png',
  price: 120,
}

const shippingAddress = {
  fullName: 'Kitti',
  street: '1 Market Street',
  city: 'Bangkok',
  postalCode: '10110',
  country: 'Thailand',
  province: 'Bangkok',
  phone: '0800000000',
}

test('serializes order documents into client DTO date strings', () => {
  const serialized = toOrderDTO({
    _id: idLike('order-1'),
    user: idLike('user-1'),
    items: [orderItem],
    shippingAddress,
    paymentMethod: 'Stripe',
    itemsPrice: 240,
    shippingPrice: 0,
    taxPrice: 36,
    totalPrice: 276,
    currencyCode: 'THB',
    expectedDeliveryDate: new Date('2026-06-04T00:00:00.000Z'),
    isDelivered: false,
    isPaid: true,
    paidAt: new Date('2026-06-02T00:00:00.000Z'),
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-02T00:00:00.000Z'),
  })

  assert.deepEqual(serialized, {
    _id: 'order-1',
    user: 'user-1',
    items: [orderItem],
    shippingAddress,
    paymentMethod: 'Stripe',
    itemsPrice: 240,
    shippingPrice: 0,
    taxPrice: 36,
    totalPrice: 276,
    currencyCode: 'THB',
    expectedDeliveryDate: '2026-06-04T00:00:00.000Z',
    isDelivered: false,
    isPaid: true,
    paidAt: '2026-06-02T00:00:00.000Z',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-02T00:00:00.000Z',
  })
})

test('serializes populated order users without document internals', () => {
  const serialized = toOrderDTO({
    _id: idLike('order-1'),
    user: {
      name: 'Kitti',
      email: 'kitti@example.com',
    },
    items: [orderItem],
    shippingAddress,
    paymentMethod: 'PayPal',
    paymentResult: {
      id: 'capture-1',
      status: 'COMPLETED',
      email_address: 'payer@example.com',
      pricePaid: '276.00',
    },
    itemsPrice: 240,
    shippingPrice: 0,
    taxPrice: 36,
    totalPrice: 276,
    currencyCode: 'THB',
    expectedDeliveryDate: new Date('2026-06-04T00:00:00.000Z'),
    isDelivered: true,
    deliveredAt: new Date('2026-06-05T00:00:00.000Z'),
    isPaid: true,
    paidAt: new Date('2026-06-02T00:00:00.000Z'),
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-05T00:00:00.000Z'),
  })

  assert.deepEqual(serialized.user, {
    name: 'Kitti',
    email: 'kitti@example.com',
  })
})
