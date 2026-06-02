import assert from 'node:assert/strict'
import test from 'node:test'

import { toProductDTO } from '../lib/application/products/serializers'

const idLike = (value: string) => ({
  toString: () => value,
})

test('serializes full product documents into client DTOs', () => {
  const serialized = toProductDTO({
    _id: idLike('product-1'),
    name: 'Studio Bag',
    slug: 'studio-bag',
    category: 'bags',
    images: ['/images/studio-bag.png'],
    brand: 'Acme',
    description: 'Durable everyday bag',
    price: 120,
    listPrice: 150,
    countInStock: 8,
    tags: ['todays-deal'],
    colors: ['Black'],
    sizes: ['One Size'],
    avgRating: 4.8,
    numReviews: 12,
    ratingDistribution: [{ rating: 5, count: 10 }],
    numSales: 40,
    isPublished: true,
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-02T00:00:00.000Z'),
  })

  assert.deepEqual(serialized, {
    _id: 'product-1',
    name: 'Studio Bag',
    slug: 'studio-bag',
    category: 'bags',
    images: ['/images/studio-bag.png'],
    brand: 'Acme',
    description: 'Durable everyday bag',
    price: 120,
    listPrice: 150,
    countInStock: 8,
    tags: ['todays-deal'],
    colors: ['Black'],
    sizes: ['One Size'],
    avgRating: 4.8,
    numReviews: 12,
    ratingDistribution: [{ rating: 5, count: 10 }],
    numSales: 40,
    isPublished: true,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-02T00:00:00.000Z',
  })
})

test('fills missing optional product arrays for card projections', () => {
  const serialized = toProductDTO({
    _id: idLike('product-1'),
    name: 'Studio Bag',
    slug: 'studio-bag',
    category: 'bags',
    brand: 'Acme',
    price: 120,
    listPrice: 150,
    countInStock: 8,
    avgRating: 4.8,
    numReviews: 12,
  })

  assert.deepEqual(serialized.images, [])
  assert.deepEqual(serialized.tags, [])
  assert.deepEqual(serialized.colors, [])
  assert.deepEqual(serialized.sizes, [])
  assert.deepEqual(serialized.ratingDistribution, [])
})
