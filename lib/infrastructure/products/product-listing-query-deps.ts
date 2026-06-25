import type { ProductListingQueryDeps } from '@/lib/application/products/product-listing-query'
import type { ProductRecord } from '@/lib/application/products/serializers'
import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'
import { PRODUCT_CARD_FIELDS } from '@/lib/product-query-fields'

export const productListingQueryDeps: ProductListingQueryDeps = {
  async findProducts({ conditions, order, skip, limit }) {
    await connectToDatabase()
    return Product.find(conditions, PRODUCT_CARD_FIELDS)
      .sort(order)
      .skip(skip)
      .limit(limit)
      .lean<ProductRecord[]>()
  },
  async countProducts(conditions) {
    await connectToDatabase()
    return Product.countDocuments(conditions)
  },
}
