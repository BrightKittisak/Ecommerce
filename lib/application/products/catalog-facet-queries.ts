import {
  normalizeCatalogFacetValues,
  normalizePublishedTagLabels,
} from '../../catalog-facets'

export type PublishedTagsAggregationRow = {
  uniqueTags?: string[]
}

export type ProductCatalogFacetDeps = {
  findPublishedCategories(): Promise<unknown[]>
  findPublishedTagRows(): Promise<PublishedTagsAggregationRow[]>
}

export async function getPublishedCatalogCategories({
  deps,
}: {
  deps: ProductCatalogFacetDeps
}) {
  const categories = await deps.findPublishedCategories()
  return normalizeCatalogFacetValues(categories)
}

export async function getPublishedCatalogTags({
  deps,
}: {
  deps: ProductCatalogFacetDeps
}) {
  const tags = await deps.findPublishedTagRows()
  return normalizePublishedTagLabels(tags)
}
