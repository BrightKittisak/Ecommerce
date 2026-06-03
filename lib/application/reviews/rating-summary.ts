export type ReviewRatingAggregationRow = {
  _id: number
  count: number
}

export type RatingDistributionItem = {
  rating: number
  count: number
}

export type ReviewRatingSummary = {
  avgRating: number
  numReviews: number
  ratingDistribution: RatingDistributionItem[]
}

export function buildReviewRatingSummary(
  rows: ReviewRatingAggregationRow[]
): ReviewRatingSummary {
  const numReviews = rows.reduce((sum, row) => sum + row.count, 0)
  const ratingTotal = rows.reduce(
    (sum, row) => sum + row._id * row.count,
    0
  )
  const avgRating =
    numReviews === 0 ? 0 : Number((ratingTotal / numReviews).toFixed(1))
  const ratingCounts = new Map(rows.map((row) => [row._id, row.count]))

  return {
    avgRating,
    numReviews,
    ratingDistribution: [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: ratingCounts.get(rating) ?? 0,
    })),
  }
}
