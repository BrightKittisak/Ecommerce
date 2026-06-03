import assert from 'node:assert/strict'
import test from 'node:test'

import { getRelatedProductsByCategoryQuery } from '../lib/application/products/related-products-query'

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

test('returns related products by category with pagination metadata', async () => {
  let findInput:
    | {
        conditions: Record<string, unknown>
        skip: number
        limit: number
      }
    | undefined
  let countConditions: Record<string, unknown> | undefined

  const result = await getRelatedProductsByCategoryQuery({
    input: {
      category: 'bags',
      productId: 'product-1',
      limit: 2,
      page: 2,
    },
    deps: {
      findRelatedProductsByCategory: async (input) => {
        findInput = input
        return [productRecord('product-2'), productRecord('product-3')]
      },
      countRelatedProductsByCategory: async (conditions) => {
        countConditions = conditions
        return 5
      },
    },
  })

  assert.deepEqual(findInput, {
    conditions: {
      isPublished: true,
      category: 'bags',
      _id: { $ne: 'product-1' },
    },
    skip: 2,
    limit: 2,
  })
  assert.deepEqual(countConditions, findInput?.conditions)
  assert.deepEqual(
    result.data.map((product) => product._id),
    ['product-2', 'product-3']
  )
  assert.equal(result.totalPages, 3)
})

test('normalizes invalid related product pages to the first page', async () => {
  let skip: number | undefined

  await getRelatedProductsByCategoryQuery({
    input: {
      category: 'bags',
      productId: 'product-1',
      limit: 4,
      page: Number.NaN,
    },
    deps: {
      findRelatedProductsByCategory: async (input) => {
        skip = input.skip
        return []
      },
      countRelatedProductsByCategory: async () => 0,
    },
  })

  assert.equal(skip, 0)
})
