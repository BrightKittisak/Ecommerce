'use server'

import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { auth } from '@/auth'
import {
  toReviewDetailsDTO,
  toReviewDTO,
} from '@/lib/application/reviews/serializers'
import type { ReviewDetailsDTO, ReviewDTO } from '@/lib/application/reviews/dtos'
import {
  buildReviewRatingSummary,
  ReviewRatingAggregationRow,
} from '@/lib/application/reviews/rating-summary'

import { connectToDatabase } from '../db'
import Product from '../db/models/product.model'
import Review from '../db/models/review.model'
import { formatError } from '../utils'
import { ReviewInputSchema } from '../validator'
import { PAGE_SIZE } from '../constants'
import { normalizePaginationPage } from '../pagination'

export async function createUpdateReview({
  data,
  path,
}: {
  data: z.infer<typeof ReviewInputSchema>
  path: string
}) {
  try {
    const session = await auth()
    if (!session) {
      throw new Error('กรุณาเข้าสู่ระบบก่อนรีวิวสินค้า')
    }

    const review = ReviewInputSchema.parse({
      ...data,
      user: session?.user?.id,
    })

    await connectToDatabase()
    const existReview = await Review.findOne({
      product: review.product,
      user: review.user,
    })

    if (existReview) {
      existReview.comment = review.comment
      existReview.rating = review.rating
      existReview.title = review.title
      await existReview.save()
      await updateProductReview(review.product)
      revalidatePath(path)
      return {
        success: true,
        message: 'อัปเดตรีวิวเรียบร้อยแล้ว',
      }
    } else {
      await Review.create(review)
      await updateProductReview(review.product)
      revalidatePath(path)
      return {
        success: true,
        message: 'ส่งรีวิวเรียบร้อยแล้ว',
      }
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}

const updateProductReview = async (productId: string) => {
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
}

export async function getReviews({
  productId,
  limit,
  page,
}: {
  productId: string
  limit?: number
  page: number
}) {
  limit = limit || PAGE_SIZE
  const currentPage = normalizePaginationPage(page)
  await connectToDatabase()
  const skipAmount = (currentPage - 1) * limit
  const reviews = await Review.find({ product: productId })
    .populate('user', 'name')
    .sort({
      createdAt: 'desc',
    })
    .skip(skipAmount)
    .limit(limit)
  const reviewsCount = await Review.countDocuments({ product: productId })
  return {
    data: reviews.map((review) => toReviewDetailsDTO(review)) satisfies ReviewDetailsDTO[],
    totalPages: reviewsCount === 0 ? 1 : Math.ceil(reviewsCount / limit),
  }
}
export const getReviewByProductId = async ({
  productId,
}: {
  productId: string
}) => {
  await connectToDatabase()
  const session = await auth()
  if (!session) {
    throw new Error('กรุณาเข้าสู่ระบบก่อนรีวิวสินค้า')
  }
  const review = await Review.findOne({
    product: productId,
    user: session?.user?.id,
  })
  return review ? (toReviewDTO(review) satisfies ReviewDTO) : null
}
