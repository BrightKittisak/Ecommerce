import type {
  AdminOrderListQueryDeps,
  AdminOrderRecord,
} from '@/lib/application/admin/admin-orders'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'

export const adminOrderListQueryDeps: AdminOrderListQueryDeps = {
  async findAdminOrders({ skip, limit }) {
    await connectToDatabase()
    return Order.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .lean<AdminOrderRecord[]>()
  },
  async countAdminOrders() {
    await connectToDatabase()
    return Order.countDocuments()
  },
}
