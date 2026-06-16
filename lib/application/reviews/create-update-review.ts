import type { z } from 'zod'

import type { ReviewInputSchema } from '../../domain/review/review.schema'

type ReviewInput = z.infer<typeof ReviewInputSchema>

type EditableReviewRecord = {
  title: string
  comment: string
  rating: number
  save(): Promise<unknown>
}

type ReviewRecord = ReviewInput & {
  user: string
}

export type CreateUpdateReviewDeps = {
  createReview(review: ReviewRecord): Promise<unknown>
  findReviewByProductAndUser(input: {
    product: string
    user: string
  }): Promise<EditableReviewRecord | null>
  updateProductReviewRating(productId: string): Promise<void>
}

type CreateUpdateReviewInput = {
  review: ReviewRecord
  deps: CreateUpdateReviewDeps
}

export type CreateUpdateReviewResult =
  | {
      status: 'created'
    }
  | {
      status: 'updated'
    }

export async function createUpdateProductReview({
  review,
  deps,
}: CreateUpdateReviewInput): Promise<CreateUpdateReviewResult> {
  const existingReview = await deps.findReviewByProductAndUser({
    product: review.product,
    user: review.user,
  })

  if (existingReview) {
    existingReview.comment = review.comment
    existingReview.rating = review.rating
    existingReview.title = review.title
    await existingReview.save()
    await deps.updateProductReviewRating(review.product)
    return {
      status: 'updated',
    }
  }

  await deps.createReview(review)
  await deps.updateProductReviewRating(review.product)
  return {
    status: 'created',
  }
}
