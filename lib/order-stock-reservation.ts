export type StockReservation = {
  productId: string
  quantity: number
}

type ProductQuantityItem = {
  product: string
  quantity: number
  [key: string]: unknown
}

export function aggregateStockReservations(
  items: ProductQuantityItem[]
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
