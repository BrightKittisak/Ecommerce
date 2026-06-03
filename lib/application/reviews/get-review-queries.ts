import { normalizePaginationPage } from '../../pagination'

import type { ReviewDetailsDTO, ReviewDTO } from './dtos'
import {
  type ReviewDetailsRecord,
  type ReviewRecord,
  toReviewDTO,
  toReviewDetailsDTO,
} from './serializers'

export type ReviewReadDeps = {
  countReviewsByProduct(productId: string): Promise<number>
  findCurrentUserReview(input: {
    productId: string
    userId: string
  }): Promise<ReviewRecord | null>
  findReviewsByProduct(input: {
    productId: string
    skip: number
    limit: number
  }): Promise<ReviewDetailsRecord[]>
}

export async function getProductReviews({
  productId,
  limit,
  page,
  deps,
}: {
  productId: string
  limit: number
  page: number
  deps: ReviewReadDeps
}) {
  const currentPage = normalizePaginationPage(page)
  const skip = (currentPage - 1) * limit
  const [reviews, reviewsCount] = await Promise.all([
    deps.findReviewsByProduct({ productId, skip, limit }),
    deps.countReviewsByProduct(productId),
  ])

  return {
    data: reviews.map((review) =>
      toReviewDetailsDTO(review)
    ) satisfies ReviewDetailsDTO[],
    totalPages: reviewsCount === 0 ? 1 : Math.ceil(reviewsCount / limit),
  }
}

export async function getCurrentUserReviewByProduct({
  productId,
  userId,
  deps,
}: {
  productId: string
  userId: string
  deps: ReviewReadDeps
}): Promise<ReviewDTO | null> {
  const review = await deps.findCurrentUserReview({ productId, userId })
  return review ? (toReviewDTO(review) satisfies ReviewDTO) : null
}
