import type { RelatedProductsQueryDeps } from '@/lib/application/products/related-products-query'
import type { ProductRecord } from '@/lib/application/products/serializers'
import Product from '@/lib/db/models/product.model'
import { PRODUCT_CARD_FIELDS } from '@/lib/product-query-fields'

export const relatedProductsQueryDeps: RelatedProductsQueryDeps = {
  findRelatedProductsByCategory({ conditions, skip, limit }) {
    return Product.find(conditions, PRODUCT_CARD_FIELDS)
      .sort({ numSales: 'desc' })
      .skip(skip)
      .limit(limit)
      .lean<ProductRecord[]>()
  },
  countRelatedProductsByCategory(conditions) {
    return Product.countDocuments(conditions)
  },
}
