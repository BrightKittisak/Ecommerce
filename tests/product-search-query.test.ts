import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildProductNameSearchFilter,
  buildProductPriceFilter,
  buildProductRatingFilter,
  escapeRegexLiteral,
  normalizeProductSearchQuery,
} from '../lib/product-search-query'

test('normalizes empty and all product search queries', () => {
  assert.equal(normalizeProductSearchQuery(''), null)
  assert.equal(normalizeProductSearchQuery('   '), null)
  assert.equal(normalizeProductSearchQuery('all'), null)
})

test('caps product search query length', () => {
  const longQuery = 'x'.repeat(120)

  assert.equal(normalizeProductSearchQuery(longQuery)?.length, 80)
})

test('escapes regex metacharacters for literal product search', () => {
  assert.equal(escapeRegexLiteral('watch.*(sale)?'), 'watch\\.\\*\\(sale\\)\\?')
})

test('builds a case-insensitive literal product name filter', () => {
  assert.deepEqual(buildProductNameSearchFilter(' watch.* '), {
    name: {
      $regex: 'watch\\.\\*',
      $options: 'i',
    },
  })
})

test('builds product rating filters only for valid ratings', () => {
  assert.deepEqual(buildProductRatingFilter('4'), {
    avgRating: {
      $gte: 4,
    },
  })
  assert.deepEqual(buildProductRatingFilter('all'), {})
  assert.deepEqual(buildProductRatingFilter('0'), {})
  assert.deepEqual(buildProductRatingFilter('6'), {})
  assert.deepEqual(buildProductRatingFilter('not-a-rating'), {})
})

test('builds product price filters only for valid ranges', () => {
  assert.deepEqual(buildProductPriceFilter('100-500'), {
    price: {
      $gte: 100,
      $lte: 500,
    },
  })
  assert.deepEqual(buildProductPriceFilter('all'), {})
  assert.deepEqual(buildProductPriceFilter('-1-500'), {})
  assert.deepEqual(buildProductPriceFilter('500-100'), {})
  assert.deepEqual(buildProductPriceFilter('not-a-price'), {})
})
