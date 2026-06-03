import type { CreateOrderInput, IOrderInput, OrderItem } from '../../../types'
import { CURRENCY_CODE } from '../../utils'
import { calcDeliveryDateAndPrice } from '../../domain/order/pricing'
import { OrderInputSchema } from '../../validator'
import {
  type ProductStockReservationDeps,
  releaseProductStock,
  reserveProductStock,
} from './product-stock-reservation'
import type { BuildOrderItemsDeps } from './build-order-items'
import { buildOrderItemsFromRequest } from './build-order-items'
import { aggregateStockReservations } from '../../order-stock-reservation'

export type CreatedOrderRecord = {
  _id: {
    toString(): string
  }
}

export type CreateOrderFromCartDeps = BuildOrderItemsDeps &
  ProductStockReservationDeps & {
    createOrder(order: IOrderInput): Promise<CreatedOrderRecord>
  }

export async function createOrderFromCart({
  clientOrder,
  userId,
  deps,
}: {
  clientOrder: CreateOrderInput
  userId: string
  deps: CreateOrderFromCartDeps
}): Promise<CreatedOrderRecord> {
  const items = await buildOrderItemsFromRequest({
    items: clientOrder.items,
    deps,
  })
  const stockReservations = aggregateStockReservations(clientOrder.items)
  const order = buildOrderInput({
    clientOrder,
    userId,
    items,
  })
  const reservedStock = await reserveProductStock({
    reservations: stockReservations,
    deps,
  })

  try {
    return await deps.createOrder(order)
  } catch (error) {
    await releaseProductStock({
      reservations: reservedStock,
      deps,
    })
    throw error
  }
}

function buildOrderInput({
  clientOrder,
  userId,
  items,
}: {
  clientOrder: CreateOrderInput
  userId: string
  items: OrderItem[]
}): IOrderInput {
  const cart = {
    ...clientOrder,
    items,
    ...calcDeliveryDateAndPrice({
      items,
      shippingAddress: clientOrder.shippingAddress,
      deliveryDateIndex: clientOrder.deliveryDateIndex,
    }),
  }

  return OrderInputSchema.parse({
    user: userId,
    items: cart.items,
    shippingAddress: cart.shippingAddress,
    paymentMethod: cart.paymentMethod,
    itemsPrice: cart.itemsPrice,
    shippingPrice: cart.shippingPrice,
    taxPrice: cart.taxPrice,
    totalPrice: cart.totalPrice,
    currencyCode: CURRENCY_CODE,
    expectedDeliveryDate: cart.expectedDeliveryDate,
  })
}
