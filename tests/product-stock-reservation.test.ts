import assert from 'node:assert/strict'
import test from 'node:test'

import {
  releaseProductStock,
  reserveProductStock,
} from '../lib/application/orders/product-stock-reservation'
import type { StockReservation } from '../lib/order-stock-reservation'

test('reserves product stock sequentially', async () => {
  const calls: StockReservation[] = []
  const reservations = [
    {
      productId: 'product-1',
      quantity: 2,
    },
    {
      productId: 'product-2',
      quantity: 1,
    },
  ]

  const reservedStock = await reserveProductStock({
    reservations,
    deps: {
      reservePublishedProductStock: async (reservation) => {
        calls.push(reservation)
        return true
      },
      releaseProductStock: async () => {},
    },
  })

  assert.deepEqual(calls, reservations)
  assert.deepEqual(reservedStock, reservations)
})

test('rolls back reserved stock when a later reservation fails', async () => {
  const released: StockReservation[] = []

  await assert.rejects(
    reserveProductStock({
      reservations: [
        {
          productId: 'product-1',
          quantity: 2,
        },
        {
          productId: 'product-2',
          quantity: 10,
        },
      ],
      deps: {
        reservePublishedProductStock: async (reservation) =>
          reservation.productId !== 'product-2',
        releaseProductStock: async (reservation) => {
          released.push(reservation)
        },
      },
    }),
    /สต็อกไม่เพียงพอ/
  )

  assert.deepEqual(released, [
    {
      productId: 'product-1',
      quantity: 2,
    },
  ])
})

test('releases reserved product stock in parallel through dependencies', async () => {
  const released: StockReservation[] = []
  const reservations = [
    {
      productId: 'product-1',
      quantity: 2,
    },
    {
      productId: 'product-2',
      quantity: 1,
    },
  ]

  await releaseProductStock({
    reservations,
    deps: {
      reservePublishedProductStock: async () => true,
      releaseProductStock: async (reservation) => {
        released.push(reservation)
      },
    },
  })

  assert.deepEqual(released, reservations)
})
