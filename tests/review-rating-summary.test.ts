import assert from 'node:assert/strict'
import test from 'node:test'

import { buildReviewRatingSummary } from '../lib/application/reviews/rating-summary'

test('builds a complete review rating summary from aggregation rows', () => {
  assert.deepEqual(
    buildReviewRatingSummary([
      { _id: 5, count: 3 },
      { _id: 3, count: 1 },
      { _id: 1, count: 1 },
    ]),
    {
      avgRating: 3.8,
      numReviews: 5,
      ratingDistribution: [
        { rating: 1, count: 1 },
        { rating: 2, count: 0 },
        { rating: 3, count: 1 },
        { rating: 4, count: 0 },
        { rating: 5, count: 3 },
      ],
    }
  )
})

test('builds an empty review rating summary', () => {
  assert.deepEqual(buildReviewRatingSummary([]), {
    avgRating: 0,
    numReviews: 0,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 0 },
      { rating: 5, count: 0 },
    ],
  })
})
