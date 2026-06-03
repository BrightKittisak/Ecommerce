import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getPublishedCatalogCategories,
  getPublishedCatalogTags,
} from '../lib/application/products/catalog-facet-queries'

test('returns normalized published catalog categories', async () => {
  const categories = await getPublishedCatalogCategories({
    deps: {
      findPublishedCategories: async () => [
        'Sneakers',
        'sneakers',
        '  Bags  ',
        '',
        null,
      ],
      findPublishedTagRows: async () => [],
    },
  })

  assert.deepEqual(categories, ['Bags', 'sneakers', 'Sneakers'])
})

test('returns normalized published catalog tags', async () => {
  const tags = await getPublishedCatalogTags({
    deps: {
      findPublishedCategories: async () => [],
      findPublishedTagRows: async () => [
        {
          uniqueTags: ['new-arrival', 'todays-deal', '', 'todays-deal'],
        },
      ],
    },
  })

  assert.deepEqual(tags, ['New Arrival', 'Todays Deal'])
})
