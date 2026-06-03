import type {
  OrderAccessQueryDeps,
  OrderAccessRecord,
} from '@/lib/application/orders/order-access-query'
import Order from '@/lib/db/models/order.model'

export const orderAccessQueryDeps: OrderAccessQueryDeps = {
  findOrderById(orderId) {
    return Order.findById(orderId) as Promise<OrderAccessRecord | null>
  },
}
