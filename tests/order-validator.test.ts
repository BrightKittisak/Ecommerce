import assert from 'node:assert/strict'
import test from 'node:test'

import { DEFAULT_PAYMENT_METHOD } from '../lib/constants'
import { CreateOrderSchema } from '../lib/domain/order/create-order.schema'

const validOrderInput = {
  items: [
    {
      clientId: 'cart-item-1',
      product: '507f1f77bcf86cd799439011',
      quantity: 2,
      size: 'M',
      color: 'Black',
    },
  ],
  shippingAddress: {
    fullName: 'Buyer Example',
    street: '123 Test Street',
    city: 'Bangkok',
    province: 'Bangkok',
    postalCode: '10110',
    country: 'Thailand',
    phone: '0812345678',
  },
  paymentMethod: DEFAULT_PAYMENT_METHOD,
  deliveryDateIndex: 0,
}

test('accepts a minimal server-authoritative order request', () => {
  const parsedOrder = CreateOrderSchema.parse(validOrderInput)

  assert.deepEqual(parsedOrder, validOrderInput)
})

test('rejects client-controlled item price and stock facts', () => {
  const orderWithClientControlledItemFacts = {
    ...validOrderInput,
    items: [
      {
        ...validOrderInput.items[0],
        price: 1,
        countInStock: 999,
      },
    ],
  }

  assert.throws(
    () => CreateOrderSchema.parse(orderWithClientControlledItemFacts),
    /Unrecognized key/
  )
})

test('rejects client-controlled order totals', () => {
  const orderWithClientTotals = {
    ...validOrderInput,
    itemsPrice: 1,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: 1,
  }

  assert.throws(
    () => CreateOrderSchema.parse(orderWithClientTotals),
    /Unrecognized key/
  )
})

test('rejects invalid product ids and non-positive quantities', () => {
  assert.throws(
    () =>
      CreateOrderSchema.parse({
        ...validOrderInput,
        items: [
          {
            ...validOrderInput.items[0],
            product: 'not-a-mongo-id',
          },
        ],
      }),
    /MongoDB/
  )

  assert.throws(
    () =>
      CreateOrderSchema.parse({
        ...validOrderInput,
        items: [
          {
            ...validOrderInput.items[0],
            quantity: 0,
          },
        ],
      }),
    /0/
  )
})

test('rejects unsupported payment methods and delivery dates', () => {
  assert.throws(
    () =>
      CreateOrderSchema.parse({
        ...validOrderInput,
        paymentMethod: 'Wire Transfer',
      }),
    /payment/
  )

  assert.throws(
    () =>
      CreateOrderSchema.parse({
        ...validOrderInput,
        deliveryDateIndex: 999,
      }),
    /Number/
  )
})
