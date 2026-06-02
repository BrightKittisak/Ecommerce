import assert from 'node:assert/strict'
import test from 'node:test'

import {
  toReviewDetailsDTO,
  toReviewDTO,
} from '../lib/application/reviews/serializers'

const idLike = (value: string) => ({
  toString: () => value,
})

test('serializes product review details into a client DTO without user ids', () => {
  const serialized = toReviewDetailsDTO({
    _id: idLike('review-1'),
    product: idLike('product-1'),
    user: {
      name: 'Kitti',
    },
    title: 'Fast shipping',
    comment: 'Arrived safely.',
    rating: 5,
    isVerifiedPurchase: true,
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-02T00:00:00.000Z'),
  })

  assert.deepEqual(serialized, {
    _id: 'review-1',
    title: 'Fast shipping',
    comment: 'Arrived safely.',
    rating: 5,
    isVerifiedPurchase: true,
    createdAt: '2026-06-01T00:00:00.000Z',
    user: {
      name: 'Kitti',
    },
  })
})

test('serializes a signed-in users review into an editable DTO', () => {
  const serialized = toReviewDTO({
    _id: idLike('review-1'),
    product: idLike('product-1'),
    user: idLike('user-1'),
    title: 'Fast shipping',
    comment: 'Arrived safely.',
    rating: 5,
    isVerifiedPurchase: true,
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-02T00:00:00.000Z'),
  })

  assert.deepEqual(serialized, {
    _id: 'review-1',
    product: 'product-1',
    user: 'user-1',
    title: 'Fast shipping',
    comment: 'Arrived safely.',
    rating: 5,
    isVerifiedPurchase: true,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-02T00:00:00.000Z',
  })
})
