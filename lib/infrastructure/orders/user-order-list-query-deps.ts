import type { UserOrderListQueryDeps } from '@/lib/application/orders/user-order-list-query'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'

export const userOrderListQueryDeps: UserOrderListQueryDeps = {
  async findOrdersForUser({ userId, skip, limit }) {
    await connectToDatabase()
    return Order.find({
      user: userId,
    })
      .sort({ createdAt: 'desc' })
      .skip(skip)
      .limit(limit)
  },
  async countOrdersForUser(userId) {
    await connectToDatabase()
    return Order.countDocuments({ user: userId })
  },
}
