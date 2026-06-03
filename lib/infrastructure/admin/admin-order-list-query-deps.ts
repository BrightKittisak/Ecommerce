import type {
  AdminOrderListQueryDeps,
  AdminOrderRecord,
} from '@/lib/application/admin/admin-orders'
import Order from '@/lib/db/models/order.model'

export const adminOrderListQueryDeps: AdminOrderListQueryDeps = {
  findAdminOrders({ skip, limit }) {
    return Order.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .lean<AdminOrderRecord[]>()
  },
  countAdminOrders() {
    return Order.countDocuments()
  },
}
