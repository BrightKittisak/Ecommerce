import assert from 'node:assert/strict'
import test from 'node:test'

import { getUserOrderList } from '../lib/application/orders/user-order-list-query'

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

const orderRecord = (id: string) => ({
  _id: idLike(id),
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
})

test('returns paginated order DTOs for a user', async () => {
  let findInput:
    | {
        userId: string
        skip: number
        limit: number
      }
    | undefined
  let countedUserId: string | undefined

  const result = await getUserOrderList({
    userId: 'user-1',
    limit: 2,
    page: 3,
    deps: {
      findOrdersForUser: async (input) => {
        findInput = input
        return [orderRecord('order-5'), orderRecord('order-6')]
      },
      countOrdersForUser: async (userId) => {
        countedUserId = userId
        return 7
      },
    },
  })

  assert.deepEqual(findInput, {
    userId: 'user-1',
    skip: 4,
    limit: 2,
  })
  assert.equal(countedUserId, 'user-1')
  assert.deepEqual(
    result.data.map((order) => order._id),
    ['order-5', 'order-6']
  )
  assert.equal(result.totalPages, 4)
})

test('defaults order list pagination to the first page', async () => {
  let findInput:
    | {
        userId: string
        skip: number
        limit: number
      }
    | undefined

  await getUserOrderList({
    userId: 'user-1',
    page: Number.NaN,
    deps: {
      findOrdersForUser: async (input) => {
        findInput = input
        return []
      },
      countOrdersForUser: async () => 0,
    },
  })

  assert.deepEqual(findInput, {
    userId: 'user-1',
    skip: 0,
    limit: 9,
  })
})
