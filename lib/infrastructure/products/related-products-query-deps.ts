import type { RelatedProductsQueryDeps } from '@/lib/application/products/related-products-query'
import type { ProductRecord } from '@/lib/application/products/serializers'
import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'
import { PRODUCT_CARD_FIELDS } from '@/lib/product-query-fields'

export const relatedProductsQueryDeps: RelatedProductsQueryDeps = {
  async findRelatedProductsByCategory({ conditions, skip, limit }) {
    await connectToDatabase()
    return Product.find(conditions, PRODUCT_CARD_FIELDS)
      .sort({ numSales: 'desc' })
      .skip(skip)
      .limit(limit)
      .lean<ProductRecord[]>()
  },
  async countRelatedProductsByCategory(conditions) {
    await connectToDatabase()
    return Product.countDocuments(conditions)
  },
}
