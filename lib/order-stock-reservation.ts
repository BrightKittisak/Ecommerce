import { CreateOrderInput } from '@/types'

export type StockReservation = {
  productId: string
  quantity: number
}

export function aggregateStockReservations(
  items: CreateOrderInput['items']
): StockReservation[] {
  const quantityByProductId = new Map<string, number>()

  for (const item of items) {
    quantityByProductId.set(
      item.product,
      (quantityByProductId.get(item.product) ?? 0) + item.quantity
    )
  }

  return [...quantityByProductId.entries()].map(([productId, quantity]) => ({
    productId,
    quantity,
  }))
}
