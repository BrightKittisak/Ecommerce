import mongoose from 'mongoose'

import type { CreateUpdateReviewDeps } from '@/lib/application/reviews/create-update-review'
import {
  buildReviewRatingSummary,
  type ReviewRatingAggregationRow,
} from '@/lib/application/reviews/rating-summary'
import Product from '@/lib/db/models/product.model'
import Review from '@/lib/db/models/review.model'

export const reviewDeps: CreateUpdateReviewDeps = {
  createReview(review) {
    return Review.create(review)
  },
  findReviewByProductAndUser({ product, user }) {
    return Review.findOne({ product, user })
  },
  async updateProductReviewRating(productId) {
    const result = await Review.aggregate<ReviewRatingAggregationRow>([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ])
    await Product.findByIdAndUpdate(productId, buildReviewRatingSummary(result))
  },
}
