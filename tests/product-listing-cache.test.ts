import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  createProductListingCacheKey,
  getCachedProductListing,
  PRODUCT_LISTING_CACHE_MAX_ENTRIES,
  PRODUCT_LISTING_CACHE_TTL_MS,
} from '../lib/product-listing-cache'

const baseInput = {
  query: 'all',
  category: 'all',
  tag: 'all',
  page: 1,
}

test('canonicalizes equivalent product listing cache keys', () => {
  assert.equal(
    createProductListingCacheKey(baseInput),
    createProductListingCacheKey({
      ...baseInput,
      query: '  all ',
      category: '',
      tag: '',
      page: Number.NaN,
      price: 'invalid',
      rating: 'invalid',
      sort: 'invalid',
    })
  )
})

test('separates cache keys for different listing results', () => {
  const defaultKey = createProductListingCacheKey(baseInput)

  assert.notEqual(
    defaultKey,
    createProductListingCacheKey({ ...baseInput, query: 'shoe' })
  )
  assert.notEqual(
    defaultKey,
    createProductListingCacheKey({ ...baseInput, category: 'bags' })
  )
  assert.notEqual(
    defaultKey,
    createProductListingCacheKey({ ...baseInput, page: 2 })
  )
})

test('bounds hot product listing cache memory and staleness', () => {
  assert.equal(PRODUCT_LISTING_CACHE_MAX_ENTRIES, 200)
  assert.equal(PRODUCT_LISTING_CACHE_TTL_MS, 30_000)
})

test('coalesces identical product listing loads through the real wrapper', async () => {
  let loads = 0
  const input = { ...baseInput, query: 'unique-cache-test-query' }
  const load = async () => {
    loads += 1
    return {
      products: [],
      totalPages: 0,
      totalProducts: 0,
      from: 1,
      to: 0,
    }
  }

  const [first, second] = await Promise.all([
    getCachedProductListing(input, load),
    getCachedProductListing(input, load),
  ])

  assert.deepEqual(first, second)
  assert.equal(loads, 1)
})

test('routes product listing reads through the bounded cache', () => {
  const source = readFileSync('lib/actions/product.actions.ts', 'utf8')

  assert.equal(source.includes('getCachedProductListing(input'), true)
  assert.equal(source.includes('getProductListing({'), true)
})
