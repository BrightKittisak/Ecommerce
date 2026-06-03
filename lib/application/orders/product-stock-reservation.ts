import type { StockReservation } from '../../order-stock-reservation'

export type ProductStockReservationDeps = {
  reservePublishedProductStock(reservation: StockReservation): Promise<boolean>
  releaseProductStock(reservation: StockReservation): Promise<void>
}

export async function reserveProductStock({
  reservations,
  deps,
}: {
  reservations: StockReservation[]
  deps: ProductStockReservationDeps
}): Promise<StockReservation[]> {
  const reservedStock: StockReservation[] = []

  for (const reservation of reservations) {
    const reserved = await deps.reservePublishedProductStock(reservation)

    if (!reserved) {
      await releaseProductStock({ reservations: reservedStock, deps })
      throw new Error('สินค้าในสต็อกไม่เพียงพอสำหรับคำสั่งซื้อนี้')
    }

    reservedStock.push(reservation)
  }

  return reservedStock
}

export async function releaseProductStock({
  reservations,
  deps,
}: {
  reservations: StockReservation[]
  deps: ProductStockReservationDeps
}): Promise<void> {
  await Promise.all(
    reservations.map((reservation) => deps.releaseProductStock(reservation))
  )
}
