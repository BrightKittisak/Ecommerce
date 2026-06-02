import { OrderItem } from '@/types'

import Product from './db/models/product.model'
import { aggregateStockReservations } from './order-stock-reservation'

export async function incrementProductSales(items: OrderItem[]) {
  const salesIncrements = aggregateStockReservations(
    items.map((item) => ({
      product: String(item.product),
      quantity: item.quantity,
    }))
  )

  if (salesIncrements.length === 0) return

  await Product.bulkWrite(
    salesIncrements.map((increment) => ({
      updateOne: {
        filter: { _id: increment.productId },
        update: {
          $inc: {
            numSales: increment.quantity,
          },
        },
      },
    }))
  )
}
