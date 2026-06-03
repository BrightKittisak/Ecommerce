import assert from 'node:assert/strict'
import test from 'node:test'

import { getBrowsingHistoryProducts } from '../lib/application/products/browsing-history-query'

const idLike = (value: string) => ({
  toString: () => value,
})

const productRecord = (id: string, category = 'bags') => ({
  _id: idLike(id),
  name: `Product ${id}`,
  slug: `product-${id}`,
  category,
  brand: 'Acme',
  price: 120,
  listPrice: 150,
  countInStock: 4,
  avgRating: 4.5,
  numReviews: 10,
})

test('returns history products in requested browsing order', async () => {
  let queryInput:
    | {
        filter: Record<string, unknown>
        limit: number
      }
    | undefined

  const products = await getBrowsingHistoryProducts({
    query: {
      listType: 'history',
      productIds: ['product-2', 'product-1'],
      categories: [],
    },
    deps: {
      findBrowsingHistoryProducts: async (input) => {
        queryInput = input
        return [productRecord('product-1'), productRecord('product-2')]
      },
    },
  })

  assert.deepEqual(queryInput, {
    filter: {
      _id: { $in: ['product-2', 'product-1'] },
    },
    limit: 2,
  })
  assert.deepEqual(
    products.map((product) => product._id),
    ['product-2', 'product-1']
  )
})

test('limits related products and excludes already browsed products', async () => {
  let queryInput:
    | {
        filter: Record<string, unknown>
        limit: number
      }
    | undefined

  const products = await getBrowsingHistoryProducts({
    query: {
      listType: 'related',
      productIds: ['product-1'],
      categories: ['bags'],
    },
    deps: {
      findBrowsingHistoryProducts: async (input) => {
        queryInput = input
        return [productRecord('product-2')]
      },
    },
  })

  assert.deepEqual(queryInput, {
    filter: {
      category: { $in: ['bags'] },
      _id: { $nin: ['product-1'] },
    },
    limit: 24,
  })
  assert.deepEqual(
    products.map((product) => product._id),
    ['product-2']
  )
})
