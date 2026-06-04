import assert from 'node:assert/strict'
import test from 'node:test'

import { PRODUCT_INDEXES } from '../lib/db/product-indexes'

test('declares an index for default published product listing sort', () => {
  assert.deepEqual(
    PRODUCT_INDEXES.find(
      (index) => 'isPublished' in index && '_id' in index
    ),
    {
      isPublished: 1,
      _id: -1,
    }
  )
})

test('keeps product indexes for high-traffic catalog reads', () => {
  assert.ok(
    PRODUCT_INDEXES.some(
      (index) => 'isPublished' in index && 'slug' in index
    )
  )
  assert.ok(
    PRODUCT_INDEXES.some(
      (index) => 'isPublished' in index && 'category' in index
    )
  )
  assert.ok(
    PRODUCT_INDEXES.some(
      (index) => 'isPublished' in index && 'tags' in index && 'createdAt' in index
    )
  )
})
