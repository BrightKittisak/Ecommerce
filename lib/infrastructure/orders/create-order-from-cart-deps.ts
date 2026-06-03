import type { CreateOrderFromCartDeps } from '@/lib/application/orders/create-order-from-cart'
import Order from '@/lib/db/models/order.model'

import { orderItemProductDeps } from './order-item-product-deps'
import { productStockReservationDeps } from './product-stock-reservation-deps'

export const createOrderFromCartDeps: CreateOrderFromCartDeps = {
  ...orderItemProductDeps,
  ...productStockReservationDeps,
  createOrder(order) {
    return Order.create(order)
  },
}
