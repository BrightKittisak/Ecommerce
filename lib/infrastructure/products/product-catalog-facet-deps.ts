import type {
  ProductCatalogFacetDeps,
  PublishedTagsAggregationRow,
} from '@/lib/application/products/catalog-facet-queries'
import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'

export const productCatalogFacetDeps: ProductCatalogFacetDeps = {
  async findPublishedCategories() {
    await connectToDatabase()
    return Product.find({ isPublished: true }).distinct('category')
  },
  async findPublishedTagRows() {
    await connectToDatabase()
    return Product.aggregate<PublishedTagsAggregationRow>([
      { $match: { isPublished: true } },
      { $unwind: '$tags' },
      { $group: { _id: null, uniqueTags: { $addToSet: '$tags' } } },
      { $project: { _id: 0, uniqueTags: 1 } },
    ])
  },
}
