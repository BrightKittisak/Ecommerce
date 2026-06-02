import { serializeTypedForClient } from '../../serialization'

import type { ReviewDetailsDTO, ReviewDTO } from './dtos'

type IdLike = {
  toString(): string
}

type ReviewUserRecord =
  | {
      name?: string | null
    }
  | string
  | IdLike
  | null
  | undefined

type ReviewBaseRecord = {
  _id: string | IdLike
  product: string | IdLike
  title: string
  comment: string
  rating: number
  isVerifiedPurchase: boolean
  createdAt: Date
  updatedAt: Date
}

type ReviewDetailsRecord = ReviewBaseRecord & {
  user: ReviewUserRecord
}

type ReviewRecord = ReviewBaseRecord & {
  user: string | IdLike
}

const toId = (value: string | IdLike) => value.toString()

const toReviewUserDTO = (user: ReviewUserRecord): ReviewDetailsDTO['user'] => {
  if (!user || typeof user !== 'object' || !('name' in user)) {
    return null
  }

  return user.name ? { name: user.name } : null
}

export const toReviewDetailsDTO = (
  review: ReviewDetailsRecord
): ReviewDetailsDTO => {
  return serializeTypedForClient({
    _id: toId(review._id),
    title: review.title,
    comment: review.comment,
    rating: review.rating,
    isVerifiedPurchase: review.isVerifiedPurchase,
    createdAt: review.createdAt,
    user: toReviewUserDTO(review.user),
  })
}

export const toReviewDTO = (review: ReviewRecord): ReviewDTO => {
  return serializeTypedForClient({
    _id: toId(review._id),
    product: toId(review.product),
    user: toId(review.user),
    title: review.title,
    comment: review.comment,
    rating: review.rating,
    isVerifiedPurchase: review.isVerifiedPurchase,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  })
}
