import type { UserOrderListQueryDeps } from '@/lib/application/orders/user-order-list-query'
import Order from '@/lib/db/models/order.model'

export const userOrderListQueryDeps: UserOrderListQueryDeps = {
  findOrdersForUser({ userId, skip, limit }) {
    return Order.find({
      user: userId,
    })
      .sort({ createdAt: 'desc' })
      .skip(skip)
      .limit(limit)
  },
  countOrdersForUser(userId) {
    return Order.countDocuments({ user: userId })
  },
}
