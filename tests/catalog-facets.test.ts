import assert from 'node:assert/strict'
import test from 'node:test'

import {
  formatCatalogTagLabel,
  normalizeCatalogFacetValues,
  normalizePublishedTagLabels,
} from '../lib/catalog-facets'

test('normalizes catalog facet values from unknown data', () => {
  assert.deepEqual(
    normalizeCatalogFacetValues([
      ' Shoes ',
      '',
      'T-Shirts',
      'Shoes',
      null,
      123,
      'Jeans',
    ]),
    ['Jeans', 'Shoes', 'T-Shirts']
  )
})

test('formats catalog tag labels from slugs', () => {
  assert.equal(formatCatalogTagLabel('todays-deal'), 'Todays Deal')
  assert.equal(formatCatalogTagLabel('new--arrival'), 'New Arrival')
})

test('normalizes published tag aggregation rows', () => {
  assert.deepEqual(
    normalizePublishedTagLabels([
      {
        uniqueTags: ['featured', 'todays-deal', 'featured', ''],
      },
    ]),
    ['Featured', 'Todays Deal']
  )

  assert.deepEqual(normalizePublishedTagLabels([]), [])
  assert.deepEqual(normalizePublishedTagLabels([{ uniqueTags: 'featured' }]), [])
})
