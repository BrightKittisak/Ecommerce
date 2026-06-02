import assert from 'node:assert/strict'
import test from 'node:test'

import { aggregateStockReservations } from '../lib/order-stock-reservation'

test('aggregates stock reservations by product id', () => {
  assert.deepEqual(
    aggregateStockReservations([
      {
        clientId: 'cart-item-1',
        product: '507f1f77bcf86cd799439011',
        quantity: 2,
      },
      {
        clientId: 'cart-item-2',
        product: '507f1f77bcf86cd799439011',
        quantity: 3,
      },
      {
        clientId: 'cart-item-3',
        product: '507f1f77bcf86cd799439012',
        quantity: 1,
      },
    ]),
    [
      {
        productId: '507f1f77bcf86cd799439011',
        quantity: 5,
      },
      {
        productId: '507f1f77bcf86cd799439012',
        quantity: 1,
      },
    ]
  )
})
