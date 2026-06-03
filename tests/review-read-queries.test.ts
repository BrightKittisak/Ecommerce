import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getCurrentUserReviewByProduct,
  getProductReviews,
} from '../lib/application/reviews/get-review-queries'

const idLike = (value: string) => ({
  toString: () => value,
})

const reviewDetailsRecord = {
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
}

test('returns paginated product review DTOs', async () => {
  let queryInput:
    | {
        productId: string
        skip: number
        limit: number
      }
    | undefined

  const result = await getProductReviews({
    productId: 'product-1',
    limit: 4,
    page: 2,
    deps: {
      countReviewsByProduct: async () => 6,
      findCurrentUserReview: async () => null,
      findReviewsByProduct: async (input) => {
        queryInput = input
        return [reviewDetailsRecord]
      },
    },
  })

  assert.deepEqual(queryInput, {
    productId: 'product-1',
    skip: 4,
    limit: 4,
  })
  assert.deepEqual(result, {
    data: [
      {
        _id: 'review-1',
        title: 'Fast shipping',
        comment: 'Arrived safely.',
        rating: 5,
        isVerifiedPurchase: true,
        createdAt: '2026-06-01T00:00:00.000Z',
        user: {
          name: 'Kitti',
        },
      },
    ],
    totalPages: 2,
  })
})

test('returns one page when a product has no reviews', async () => {
  const result = await getProductReviews({
    productId: 'product-1',
    limit: 4,
    page: 1,
    deps: {
      countReviewsByProduct: async () => 0,
      findCurrentUserReview: async () => null,
      findReviewsByProduct: async () => [],
    },
  })

  assert.deepEqual(result, {
    data: [],
    totalPages: 1,
  })
})

test('returns the current users editable review DTO', async () => {
  const result = await getCurrentUserReviewByProduct({
    productId: 'product-1',
    userId: 'user-1',
    deps: {
      countReviewsByProduct: async () => 0,
      findCurrentUserReview: async () => ({
        ...reviewDetailsRecord,
        user: idLike('user-1'),
      }),
      findReviewsByProduct: async () => [],
    },
  })

  assert.deepEqual(result, {
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
