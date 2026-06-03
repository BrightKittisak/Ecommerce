import assert from 'node:assert/strict'
import test from 'node:test'

import { createUpdateProductReview } from '../lib/application/reviews/create-update-review'

const review = {
  product: '507f1f77bcf86cd799439011',
  user: '507f191e810c19729de860ea',
  isVerifiedPurchase: true,
  title: 'Great product',
  comment: 'Works well',
  rating: 5,
}

test('creates a review and refreshes the product rating summary', async () => {
  let createdReview: typeof review | undefined
  let updatedRatingProductId: string | undefined

  const result = await createUpdateProductReview({
    review,
    deps: {
      createReview: async (input) => {
        createdReview = input
      },
      findReviewByProductAndUser: async () => null,
      updateProductReviewRating: async (productId) => {
        updatedRatingProductId = productId
      },
    },
  })

  assert.deepEqual(result, { status: 'created' })
  assert.deepEqual(createdReview, review)
  assert.equal(updatedRatingProductId, review.product)
})

test('updates an existing review and refreshes the product rating summary', async () => {
  let saved = false
  let updatedRatingProductId: string | undefined
  const existingReview = {
    title: 'Old title',
    comment: 'Old comment',
    rating: 1,
    save: async () => {
      saved = true
    },
  }

  const result = await createUpdateProductReview({
    review,
    deps: {
      createReview: async () => {
        throw new Error('should not create a duplicate review')
      },
      findReviewByProductAndUser: async () => existingReview,
      updateProductReviewRating: async (productId) => {
        updatedRatingProductId = productId
      },
    },
  })

  assert.deepEqual(result, { status: 'updated' })
  assert.equal(existingReview.title, review.title)
  assert.equal(existingReview.comment, review.comment)
  assert.equal(existingReview.rating, review.rating)
  assert.equal(saved, true)
  assert.equal(updatedRatingProductId, review.product)
})
