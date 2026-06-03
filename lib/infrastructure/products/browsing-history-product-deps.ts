import type { BrowsingHistoryProductDeps } from '@/lib/application/products/browsing-history-query'
import type { ProductRecord } from '@/lib/application/products/serializers'
import Product from '@/lib/db/models/product.model'
import { PRODUCT_CARD_FIELDS } from '@/lib/product-query-fields'

export const browsingHistoryProductDeps: BrowsingHistoryProductDeps = {
  findBrowsingHistoryProducts({ filter, limit }) {
    return Product.find(filter, PRODUCT_CARD_FIELDS).limit(limit).lean<ProductRecord[]>()
  },
}
