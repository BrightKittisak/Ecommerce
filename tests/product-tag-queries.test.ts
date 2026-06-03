import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getProductCardLinksByTag,
  getProductDTOsByTag,
} from '../lib/application/products/product-tag-queries'

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

test('maps tagged products into card links', async () => {
  let queryInput:
    | {
        tag: string
        limit: number
      }
    | undefined

  const products = await getProductCardLinksByTag({
    tag: 'featured',
    limit: 3,
    deps: {
      findProductCardLinksByTag: async (input) => {
        queryInput = input
        return [
          {
            name: 'Studio Bag',
            slug: 'studio-bag',
            images: ['/images/studio-bag.png'],
          },
          {
            name: 'No Image Bag',
            slug: 'no-image-bag',
          },
        ]
      },
      findProductsByTag: async () => [],
    },
  })

  assert.deepEqual(queryInput, {
    tag: 'featured',
    limit: 3,
  })
  assert.deepEqual(products, [
    {
      name: 'Studio Bag',
      href: '/product/studio-bag',
      image: '/images/studio-bag.png',
    },
    {
      name: 'No Image Bag',
      href: '/product/no-image-bag',
      image: '',
    },
  ])
})

test('maps tagged products into product DTOs', async () => {
  let queryInput:
    | {
        tag: string
        limit: number
      }
    | undefined

  const products = await getProductDTOsByTag({
    tag: 'featured',
    limit: 3,
    deps: {
      findProductCardLinksByTag: async () => [],
      findProductsByTag: async (input) => {
        queryInput = input
        return [productRecord]
      },
    },
  })

  assert.deepEqual(queryInput, {
    tag: 'featured',
    limit: 3,
  })
  assert.deepEqual(products[0], {
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
