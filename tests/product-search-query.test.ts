import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildProductNameSearchFilter,
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
