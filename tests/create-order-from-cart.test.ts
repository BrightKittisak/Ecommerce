import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createOrderFromCart,
  type CreateOrderFromCartDeps,
} from '../lib/application/orders/create-order-from-cart'
import { DEFAULT_PAYMENT_METHOD } from '../lib/constants'
import type { IOrderInput } from '../types'

const productId = '507f1f77bcf86cd799439011'
const userId = '507f1f77bcf86cd799439012'

const clientOrder = {
  items: [
    {
      clientId: 'cart-item-1',
      product: productId,
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

const productRecord = {
  _id: {
    toString: () => productId,
  },
  name: 'Studio Bag',
  slug: 'studio-bag',
  category: 'bags',
  images: ['/images/studio-bag.png'],
  price: 100,
  countInStock: 5,
  sizes: ['M'],
  colors: ['Black'],
}

function createDeps(overrides: Partial<CreateOrderFromCartDeps> = {}) {
  const released: unknown[] = []
  const createdOrders: IOrderInput[] = []
  const deps: CreateOrderFromCartDeps = {
    findPublishedProductsForOrderItems: async () => [productRecord],
    reservePublishedProductStock: async () => true,
    releaseProductStock: async (reservation) => {
      released.push(reservation)
    },
    createOrder: async (order) => {
      createdOrders.push(order)
      return {
        _id: {
          toString: () => 'order-1',
        },
      }
    },
    ...overrides,
  }

  return {
    deps,
    released,
    createdOrders,
  }
}

test('creates an order from cart facts recalculated on the server', async () => {
  const { deps, createdOrders } = createDeps()

  const createdOrder = await createOrderFromCart({
    clientOrder,
    userId,
    deps,
  })

  assert.equal(createdOrder._id.toString(), 'order-1')
  assert.equal(createdOrders.length, 1)
  assert.equal(createdOrders[0].user, userId)
  assert.equal(createdOrders[0].items[0].price, 100)
  assert.equal(createdOrders[0].items[0].countInStock, 5)
  assert.equal(createdOrders[0].currencyCode, 'THB')
  assert.equal(createdOrders[0].totalPrice, 650)
})

test('reserves aggregated stock before creating an order', async () => {
  const reservations: unknown[] = []
  const { deps } = createDeps({
    reservePublishedProductStock: async (reservation) => {
      reservations.push(reservation)
      return true
    },
  })

  await createOrderFromCart({
    clientOrder: {
      ...clientOrder,
      items: [
        clientOrder.items[0],
        {
          ...clientOrder.items[0],
          clientId: 'cart-item-2',
          quantity: 3,
        },
      ],
    },
    userId,
    deps,
  })

  assert.deepEqual(reservations, [
    {
      productId,
      quantity: 5,
    },
  ])
})

test('releases reserved stock when order creation fails', async () => {
  const { deps, released } = createDeps({
    createOrder: async () => {
      throw new Error('database write failed')
    },
  })

  await assert.rejects(
    createOrderFromCart({
      clientOrder,
      userId,
      deps,
    }),
    /database write failed/
  )

  assert.deepEqual(released, [
    {
      productId,
      quantity: 2,
    },
  ])
})
