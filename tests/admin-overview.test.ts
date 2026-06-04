import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getAdminOverview,
  toAdminOverviewRecentOrder,
} from '../lib/application/admin/admin-overview'

test('serializes admin overview recent orders into plain client data', () => {
  const serialized = toAdminOverviewRecentOrder({
    _id: {
      toString: () => 'order-1',
    },
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    totalPrice: 276,
    isPaid: true,
    user: {
      name: 'Kitti',
    },
  })

  assert.deepEqual(serialized, {
    _id: 'order-1',
    createdAt: '2026-06-01T00:00:00.000Z',
    totalPrice: 276,
    isPaid: true,
    customerName: 'Kitti',
  })
})

test('uses a safe customer fallback for admin overview recent orders', () => {
  const serialized = toAdminOverviewRecentOrder({
    _id: 'order-1',
    createdAt: '2026-06-01T00:00:00.000Z',
    totalPrice: 120,
    isPaid: false,
    user: 'user-1',
  })

  assert.equal(serialized.customerName, 'ลูกค้าที่ไม่ได้ระบุชื่อ')
})

test('returns admin overview stats with recent order DTOs', async () => {
  let recentOrderLimit: number | undefined

  const result = await getAdminOverview({
    recentOrderLimit: 6,
    deps: {
      countUsers: async () => 10,
      countProducts: async () => 20,
      countOrders: async () => 30,
      countPaidOrders: async () => 12,
      countLowStockProducts: async () => 3,
      sumPaidOrderRevenue: async () => 4500,
      findRecentOrders: async (limit) => {
        recentOrderLimit = limit
        return [
          {
            _id: 'order-1',
            createdAt: '2026-06-01T00:00:00.000Z',
            totalPrice: 500,
            isPaid: true,
            user: {
              name: 'Kitti',
            },
          },
        ]
      },
    },
  })

  assert.equal(recentOrderLimit, 6)
  assert.deepEqual(result, {
    totalUsers: 10,
    totalProducts: 20,
    totalOrders: 30,
    paidOrders: 12,
    lowStockProducts: 3,
    totalRevenue: 4500,
    recentOrders: [
      {
        _id: 'order-1',
        createdAt: '2026-06-01T00:00:00.000Z',
        totalPrice: 500,
        isPaid: true,
        customerName: 'Kitti',
      },
    ],
  })
})
