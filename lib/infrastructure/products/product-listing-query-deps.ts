import type { ProductListingQueryDeps } from '@/lib/application/products/product-listing-query'
import type { ProductRecord } from '@/lib/application/products/serializers'
import Product from '@/lib/db/models/product.model'
import { PRODUCT_CARD_FIELDS } from '@/lib/product-query-fields'

export const productListingQueryDeps: ProductListingQueryDeps = {
  findProducts({ conditions, order, skip, limit }) {
    return Product.find(conditions, PRODUCT_CARD_FIELDS)
      .sort(order)
      .skip(skip)
      .limit(limit)
      .lean<ProductRecord[]>()
  },
  countProducts(conditions) {
    return Product.countDocuments(conditions)
  },
}
