import assert from 'node:assert/strict'
import test from 'node:test'

import { getPublishedProductBySlug } from '../lib/application/products/product-slug-query'

const idLike = (value: string) => ({
  toString: () => value,
})

const productRecord = {
  _id: idLike('product-1'),
  name: 'Studio Bag',
  slug: 'studio-bag',
  category: 'bags',
  brand: 'Acme',
  price: 120,
  listPrice: 150,
  countInStock: 4,
  avgRating: 4.5,
  numReviews: 10,
}

test('returns a published product DTO by slug', async () => {
  let requestedSlug: string | undefined

  const product = await getPublishedProductBySlug({
    slug: 'studio-bag',
    deps: {
      findPublishedProductBySlug: async (slug) => {
        requestedSlug = slug
        return productRecord
      },
    },
  })

  assert.equal(requestedSlug, 'studio-bag')
  assert.deepEqual(product, {
    _id: 'product-1',
    name: 'Studio Bag',
    slug: 'studio-bag',
    category: 'bags',
    images: [],
    brand: 'Acme',
    price: 120,
    listPrice: 150,
    countInStock: 4,
    tags: [],
    colors: [],
    sizes: [],
    avgRating: 4.5,
    numReviews: 10,
    ratingDistribution: [],
  })
})

test('rejects when no published product matches the slug', async () => {
  await assert.rejects(
    getPublishedProductBySlug({
      slug: 'missing-product',
      deps: {
        findPublishedProductBySlug: async () => null,
      },
    }),
    /ไม่พบสินค้า/
  )
})
