import { createHash } from 'node:crypto'

import type {
  ProductListingQueryInput,
  ProductListingResult,
} from './application/products/product-listing-query'
import { createAsyncTtlLruCache } from './async-ttl-lru-cache'
import { PAGE_SIZE } from './constants'
import { normalizePaginationPage } from './pagination'
import {
  buildProductPriceFilter,
  buildProductRatingFilter,
  normalizeProductSearchQuery,
} from './product-search-query'

export const PRODUCT_LISTING_CACHE_MAX_ENTRIES = 200
export const PRODUCT_LISTING_CACHE_TTL_MS = 30_000

const CACHEABLE_SORTS = new Set([
  'avg-customer-review',
  'best-selling',
  'price-high-to-low',
  'price-low-to-high',
])

function normalizeProductSort(sort?: string) {
  return sort && CACHEABLE_SORTS.has(sort) ? sort : 'newest-arrivals'
}

export function createProductListingCacheKey(
  input: ProductListingQueryInput
) {
  const keyFacts = [
    normalizeProductSearchQuery(input.query),
    input.category && input.category !== 'all' ? input.category : null,
    input.tag && input.tag !== 'all' ? input.tag : null,
    buildProductPriceFilter(input.price),
    buildProductRatingFilter(input.rating),
    normalizeProductSort(input.sort),
    normalizePaginationPage(input.page),
    input.limit || PAGE_SIZE,
  ]

  return createHash('sha256').update(JSON.stringify(keyFacts)).digest('hex')
}

const productListingCache = createAsyncTtlLruCache<
  string,
  ProductListingResult
>({
  maxEntries: PRODUCT_LISTING_CACHE_MAX_ENTRIES,
  ttlMs: PRODUCT_LISTING_CACHE_TTL_MS,
})

export function getCachedProductListing(
  input: ProductListingQueryInput,
  load: () => Promise<ProductListingResult>
) {
  return productListingCache.getOrCreate(
    createProductListingCacheKey(input),
    load
  )
}
