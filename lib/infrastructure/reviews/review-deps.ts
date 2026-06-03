import mongoose from 'mongoose'

import type { CreateUpdateReviewDeps } from '@/lib/application/reviews/create-update-review'
import type { ReviewReadDeps } from '@/lib/application/reviews/get-review-queries'
import {
  buildReviewRatingSummary,
  type ReviewRatingAggregationRow,
} from '@/lib/application/reviews/rating-summary'
import Product from '@/lib/db/models/product.model'
import Review from '@/lib/db/models/review.model'

export const reviewDeps: CreateUpdateReviewDeps & ReviewReadDeps = {
  countReviewsByProduct(productId) {
    return Review.countDocuments({ product: productId })
  },
  createReview(review) {
    return Review.create(review)
  },
  findCurrentUserReview({ productId, userId }) {
    return Review.findOne({
      product: productId,
      user: userId,
    })
  },
  findReviewByProductAndUser({ product, user }) {
    return Review.findOne({ product, user })
  },
  findReviewsByProduct({ productId, skip, limit }) {
    return Review.find({ product: productId })
      .populate('user', 'name')
      .sort({
        createdAt: 'desc',
      })
      .skip(skip)
      .limit(limit)
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
