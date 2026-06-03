import assert from 'node:assert/strict'
import test from 'node:test'

import { toAdminOverviewRecentOrder } from '../lib/application/admin/admin-overview'

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
