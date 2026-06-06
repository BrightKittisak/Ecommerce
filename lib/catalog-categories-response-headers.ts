export const CATALOG_CATEGORIES_CACHE_CONTROL =
  'public, s-maxage=300, stale-while-revalidate=600'

export const getCatalogCategoriesHeaders = () => ({
  'Cache-Control': CATALOG_CATEGORIES_CACHE_CONTROL,
})
