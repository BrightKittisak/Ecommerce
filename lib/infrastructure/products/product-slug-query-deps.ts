import type { ProductSlugQueryDeps } from '@/lib/application/products/product-slug-query'
import type { ProductRecord } from '@/lib/application/products/serializers'
import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'

export const productSlugQueryDeps: ProductSlugQueryDeps = {
  async findPublishedProductBySlug(slug) {
    await connectToDatabase()
    return Product.findOne({
      slug,
      isPublished: true,
    }).lean<ProductRecord | null>()
  },
}
