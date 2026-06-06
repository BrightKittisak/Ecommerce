import assert from 'node:assert/strict'
import test from 'node:test'
import { z } from 'zod'

import {
  getReviewActionErrorMessage,
  REVIEW_ACTION_ERROR_MESSAGE,
} from '../lib/review-action-errors'

test('uses a safe generic review action error for internal failures', () => {
  const message = getReviewActionErrorMessage(
    new Error('database write failed with connection details')
  )

  assert.equal(message, REVIEW_ACTION_ERROR_MESSAGE)
  assert.equal(message.includes('database'), false)
  assert.equal(message.includes('MONGODB_URI'), false)
})

test('preserves user-facing review validation and login messages', () => {
  const result = z
    .object({
      rating: z.number().min(1, 'กรุณาให้คะแนนสินค้า'),
    })
    .safeParse({ rating: 0 })

  assert.equal(result.success, false)
  if (!result.success) {
    assert.equal(
      getReviewActionErrorMessage(result.error),
      'rating: กรุณาให้คะแนนสินค้า'
    )
  }

  assert.equal(
    getReviewActionErrorMessage(
      new Error('กรุณาเข้าสู่ระบบก่อนรีวิวสินค้า')
    ),
    'กรุณาเข้าสู่ระบบก่อนรีวิวสินค้า'
  )
})
