'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { auth } from '@/auth'
import { createUpdateProductReview } from '@/lib/application/reviews/create-update-review'
import {
  getCurrentUserReviewByProduct,
  getProductReviews,
} from '@/lib/application/reviews/get-review-queries'
import { reviewDeps } from '@/lib/infrastructure/reviews/review-deps'

import { PAGE_SIZE } from '../constants'
import { connectToDatabase } from '../db'
import { ReviewInputSchema } from '../domain/review/review.schema'
import { getReviewActionErrorMessage } from '../review-action-errors'

export async function createUpdateReview({
  data,
  path,
}: {
  data: z.infer<typeof ReviewInputSchema>
  path: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
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
      message: getReviewActionErrorMessage(error),
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
  await connectToDatabase()
  return getProductReviews({
    productId,
    limit: limit || PAGE_SIZE,
    page,
    deps: reviewDeps,
  })
}

export const getReviewByProductId = async ({
  productId,
}: {
  productId: string
}) => {
  await connectToDatabase()
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('กรุณาเข้าสู่ระบบก่อนรีวิวสินค้า')
  }

  return getCurrentUserReviewByProduct({
    productId,
    userId: session.user.id,
    deps: reviewDeps,
  })
}
