import type {
  ProductCardLinkRecord,
  ProductTagQueryDeps,
} from '@/lib/application/products/product-tag-queries'
import type { ProductRecord } from '@/lib/application/products/serializers'
import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'
import { PRODUCT_CARD_FIELDS } from '@/lib/product-query-fields'

export const productTagQueryDeps: ProductTagQueryDeps = {
  async findProductCardLinksByTag({ tag, limit }) {
    await connectToDatabase()
    return Product.find(
      { tags: { $in: [tag] }, isPublished: true },
      { name: 1, slug: 1, images: 1 }
    )
      .sort({ createdAt: 'desc' })
      .limit(limit)
      .lean<ProductCardLinkRecord[]>()
  },
  async findProductsByTag({ tag, limit }) {
    await connectToDatabase()
    return Product.find({
      tags: { $in: [tag] },
      isPublished: true,
    }, PRODUCT_CARD_FIELDS)
      .sort({ createdAt: 'desc' })
      .limit(limit)
      .lean<ProductRecord[]>()
  },
}
