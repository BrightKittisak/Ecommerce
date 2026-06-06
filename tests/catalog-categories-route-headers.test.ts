import assert from 'node:assert/strict'
import test from 'node:test'

import {
  CATALOG_CATEGORIES_CACHE_CONTROL,
  getCatalogCategoriesHeaders,
} from '../lib/catalog-categories-response-headers'

test('marks catalog categories API responses as public edge-cacheable', () => {
  assert.equal(
    CATALOG_CATEGORIES_CACHE_CONTROL,
    'public, s-maxage=300, stale-while-revalidate=600'
  )
  assert.deepEqual(getCatalogCategoriesHeaders(), {
    'Cache-Control': CATALOG_CATEGORIES_CACHE_CONTROL,
  })
})
