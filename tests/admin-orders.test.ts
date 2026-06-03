import assert from 'node:assert/strict'
import test from 'node:test'

import { toAdminOrderListItem } from '../lib/application/admin/admin-orders'

test('serializes admin order list rows into plain client data', () => {
  const serialized = toAdminOrderListItem({
    _id: {
      toString: () => 'order-1',
    },
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    paidAt: new Date('2026-06-02T00:00:00.000Z'),
    isPaid: true,
    isDelivered: false,
    totalPrice: 276,
    user: {
      name: 'Kitti',
    },
  })

  assert.deepEqual(serialized, {
    _id: 'order-1',
    createdAt: '2026-06-01T00:00:00.000Z',
    paidAt: '2026-06-02T00:00:00.000Z',
    deliveredAt: undefined,
    isPaid: true,
    isDelivered: false,
    totalPrice: 276,
    customerName: 'Kitti',
  })
})

test('uses a safe customer fallback for unpopulated admin order users', () => {
  const serialized = toAdminOrderListItem({
    _id: 'order-1',
    createdAt: '2026-06-01T00:00:00.000Z',
    isPaid: false,
    isDelivered: false,
    totalPrice: 120,
    user: 'user-1',
  })

  assert.equal(serialized.customerName, 'ลูกค้าที่ไม่ได้ระบุชื่อ')
})
