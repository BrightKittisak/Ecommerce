import type { ProductStockReservationDeps } from '@/lib/application/orders/product-stock-reservation'
import Product from '@/lib/db/models/product.model'

export const productStockReservationDeps: ProductStockReservationDeps = {
  async reservePublishedProductStock({ productId, quantity }) {
    const result = await Product.updateOne(
      {
        _id: productId,
        isPublished: true,
        countInStock: { $gte: quantity },
      },
      {
        $inc: {
          countInStock: -quantity,
        },
      }
    )

    return result.modifiedCount === 1
  },
  async releaseProductStock({ productId, quantity }) {
    await Product.updateOne(
      { _id: productId },
      {
        $inc: {
          countInStock: quantity,
        },
      }
    )
  },
}
