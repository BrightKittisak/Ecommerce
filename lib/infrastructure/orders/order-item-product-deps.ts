import type {
  BuildOrderItemsDeps,
  OrderItemProductRecord,
} from '@/lib/application/orders/build-order-items'
import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'

const ORDER_ITEM_PRODUCT_FIELDS = {
  name: 1,
  slug: 1,
  category: 1,
  images: 1,
  price: 1,
  countInStock: 1,
  sizes: 1,
  colors: 1,
} as const

export const orderItemProductDeps: BuildOrderItemsDeps = {
  async findPublishedProductsForOrderItems(productIds) {
    await connectToDatabase()
    return Product.find(
      {
        _id: { $in: productIds },
        isPublished: true,
      },
      ORDER_ITEM_PRODUCT_FIELDS
    ).lean<OrderItemProductRecord[]>()
  },
}
