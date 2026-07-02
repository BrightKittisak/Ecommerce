import assert from 'node:assert/strict'
import test from 'node:test'

import { getProductListing } from '../lib/application/products/product-listing-query'

const idLike = (value: string) => ({
  toString: () => value,
})

const productRecord = (id: string) => ({
  _id: idLike(id),
  name: `Product ${id}`,
  slug: `product-${id}`,
  category: 'bags',
  brand: 'Acme',
  price: 120,
  listPrice: 150,
  countInStock: 4,
  avgRating: 4.5,
  numReviews: 10,
})

test('builds product listing filters, sort order, and pagination', async () => {
  let findInput:
    | {
        conditions: Record<string, unknown>
        order: Record<string, 1 | -1>
        skip: number
        limit: number
      }
    | undefined
  let countConditions: Record<string, unknown> | undefined

  const result = await getProductListing({
    input: {
      query: ' watch.* ',
      category: 'bags',
      tag: 'featured',
      limit: 2,
      page: 3,
      price: '100-500',
      rating: '4',
      sort: 'price-low-to-high',
    },
    deps: {
      findProducts: async (input) => {
        findInput = input
        return [productRecord('product-5'), productRecord('product-6')]
      },
      countProducts: async (conditions) => {
        countConditions = conditions
        return 7
      },
    },
  })

  assert.deepEqual(findInput, {
    conditions: {
      isPublished: true,
      name: {
        $regex: 'watch\\.\\*',
        $options: 'i',
      },
      tags: 'featured',
      category: 'bags',
      price: {
        $gte: 100,
        $lte: 500,
      },
      avgRating: {
        $gte: 4,
      },
    },
    order: { price: 1 },
    skip: 4,
    limit: 2,
  })
  assert.deepEqual(countConditions, findInput?.conditions)
  assert.deepEqual(
    result.products.map((product) => product._id),
    ['product-5', 'product-6']
  )
  assert.equal(result.totalPages, 4)
  assert.equal(result.totalProducts, 7)
  assert.equal(result.from, 5)
  assert.equal(result.to, 6)
})

test('defaults product listing pagination and sort for all filters', async () => {
  let findInput:
    | {
        conditions: Record<string, unknown>
        order: Record<string, 1 | -1>
        skip: number
        limit: number
      }
    | undefined

  await getProductListing({
    input: {
      query: 'all',
      category: 'all',
      tag: 'all',
      page: Number.NaN,
    },
    deps: {
      findProducts: async (input) => {
        findInput = input
        return []
      },
      countProducts: async () => 0,
    },
  })

  assert.deepEqual(findInput, {
    conditions: {
      isPublished: true,
    },
    order: { _id: -1 },
    skip: 0,
    limit: 9,
  })
})

test('normalizes unsafe custom product listing limits', async () => {
  const observedLimits: number[] = []
  const deps = {
    findProducts: async ({ limit }: { limit: number }) => {
      observedLimits.push(limit)
      return []
    },
    countProducts: async () => 0,
  }

  await getProductListing({
    input: {
      query: 'all',
      category: 'all',
      tag: 'all',
      limit: 999,
      page: 1,
    },
    deps,
  })
  await getProductListing({
    input: {
      query: 'all',
      category: 'all',
      tag: 'all',
      limit: -1,
      page: 1,
    },
    deps,
  })

  assert.deepEqual(observedLimits, [50, 9])
})
