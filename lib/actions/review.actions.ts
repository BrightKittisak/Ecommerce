'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { auth } from '@/auth'
import { createUpdateProductReview } from '@/lib/application/reviews/create-update-review'
import type { ReviewDetailsDTO, ReviewDTO } from '@/lib/application/reviews/dtos'
import {
  toReviewDetailsDTO,
  toReviewDTO,
} from '@/lib/application/reviews/serializers'
import { reviewDeps } from '@/lib/infrastructure/reviews/review-deps'

import { PAGE_SIZE } from '../constants'
import { connectToDatabase } from '../db'
import Review from '../db/models/review.model'
import { normalizePaginationPage } from '../pagination'
import { formatError } from '../utils'
import { ReviewInputSchema } from '../validator'

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
      user: session.user.id,
    })

    await connectToDatabase()
    const result = await createUpdateProductReview({
      review,
      deps: reviewDeps,
    })

    revalidatePath(path)
    return {
      success: true,
      message:
        result.status === 'updated'
          ? 'อัปเดตรีวิวเรียบร้อยแล้ว'
          : 'ส่งรีวิวเรียบร้อยแล้ว',
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
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
    data: reviews.map((review) =>
      toReviewDetailsDTO(review)
    ) satisfies ReviewDetailsDTO[],
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
    user: session.user.id,
  })
  return review ? (toReviewDTO(review) satisfies ReviewDTO) : null
}
