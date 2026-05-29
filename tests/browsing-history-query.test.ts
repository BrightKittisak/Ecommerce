import assert from 'node:assert/strict'
import test from 'node:test'

import { parseBrowsingHistoryQuery } from '../lib/browsing-history-query'

const productIds = [
  '507f1f77bcf86cd799439011',
  '507f1f77bcf86cd799439012',
]

test('parses a valid browsing history query', () => {
  const parsedQuery = parseBrowsingHistoryQuery(
    new URLSearchParams({
      ids: productIds.join(','),
      categories: 'Shoes,Bags',
    })
  )

  assert.deepEqual(parsedQuery, {
    listType: 'history',
    productIds,
    categories: ['Shoes', 'Bags'],
  })
})

test('normalizes unsupported list types to history', () => {
  const parsedQuery = parseBrowsingHistoryQuery(
    new URLSearchParams({
      type: 'surprise',
      ids: productIds[0],
      categories: 'Shoes',
    })
  )

  assert.equal(parsedQuery?.listType, 'history')
})

test('accepts related list type explicitly', () => {
  const parsedQuery = parseBrowsingHistoryQuery(
    new URLSearchParams({
      type: 'related',
      ids: productIds[0],
      categories: 'Shoes',
    })
  )

  assert.equal(parsedQuery?.listType, 'related')
})

test('rejects queries without valid product ids or categories', () => {
  assert.equal(
    parseBrowsingHistoryQuery(
      new URLSearchParams({
        ids: 'not-a-mongo-id',
        categories: 'Shoes',
      })
    ),
    null
  )

  assert.equal(
    parseBrowsingHistoryQuery(
      new URLSearchParams({
        ids: productIds[0],
        categories: '',
      })
    ),
    null
  )
})

test('deduplicates and caps product ids and categories', () => {
  const manyProductIds = Array.from({ length: 30 }, (_, index) =>
    `${index.toString(16).padStart(24, '0')}`
  )
  const manyCategories = Array.from(
    { length: 15 },
    (_, index) => `Category ${index}`
  )
  const parsedQuery = parseBrowsingHistoryQuery(
    new URLSearchParams({
      ids: [manyProductIds[0], ...manyProductIds, manyProductIds[0]].join(','),
      categories: [
        manyCategories[0],
        ...manyCategories,
        manyCategories[0],
      ].join(','),
    })
  )

  assert.equal(parsedQuery?.productIds.length, 24)
  assert.equal(parsedQuery?.categories.length, 12)
  assert.equal(parsedQuery?.productIds[0], manyProductIds[0])
  assert.equal(parsedQuery?.categories[0], manyCategories[0])
})
