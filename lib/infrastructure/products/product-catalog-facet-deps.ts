import type {
  ProductCatalogFacetDeps,
  PublishedTagsAggregationRow,
} from '@/lib/application/products/catalog-facet-queries'
import Product from '@/lib/db/models/product.model'

export const productCatalogFacetDeps: ProductCatalogFacetDeps = {
  findPublishedCategories() {
    return Product.find({ isPublished: true }).distinct('category')
  },
  findPublishedTagRows() {
    return Product.aggregate<PublishedTagsAggregationRow>([
      { $match: { isPublished: true } },
      { $unwind: '$tags' },
      { $group: { _id: null, uniqueTags: { $addToSet: '$tags' } } },
      { $project: { _id: 0, uniqueTags: 1 } },
    ])
  },
}
