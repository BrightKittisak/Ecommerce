import type {
  OrderAccessQueryDeps,
  OrderAccessRecord,
} from '@/lib/application/orders/order-access-query'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'

export const orderAccessQueryDeps: OrderAccessQueryDeps = {
  async findOrderById(orderId) {
    await connectToDatabase()
    return Order.findById(orderId) as Promise<OrderAccessRecord | null>
  },
}
