import mongoose from 'mongoose'

import type { CreateUpdateReviewDeps } from '@/lib/application/reviews/create-update-review'
import type { ReviewReadDeps } from '@/lib/application/reviews/get-review-queries'
import {
  buildReviewRatingSummary,
  type ReviewRatingAggregationRow,
} from '@/lib/application/reviews/rating-summary'
import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'
import Review from '@/lib/db/models/review.model'

export const reviewDeps: CreateUpdateReviewDeps & ReviewReadDeps = {
  async countReviewsByProduct(productId) {
    await connectToDatabase()
    return Review.countDocuments({ product: productId })
  },
  async createReview(review) {
    await connectToDatabase()
    return Review.create(review)
  },
  async findCurrentUserReview({ productId, userId }) {
    await connectToDatabase()
    return Review.findOne({
      product: productId,
      user: userId,
    })
  },
  async findReviewByProductAndUser({ product, user }) {
    await connectToDatabase()
    return Review.findOne({ product, user })
  },
  async findReviewsByProduct({ productId, skip, limit }) {
    await connectToDatabase()
    return Review.find({ product: productId })
      .populate('user', 'name')
      .sort({
        createdAt: 'desc',
      })
      .skip(skip)
      .limit(limit)
  },
  async updateProductReviewRating(productId) {
    await connectToDatabase()
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
