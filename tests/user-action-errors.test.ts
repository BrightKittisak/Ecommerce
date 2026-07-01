import assert from 'node:assert/strict'
import test from 'node:test'
import { z } from 'zod'

import {
  getUserActionErrorMessage,
  USER_ACTION_ERROR_MESSAGE,
} from '../lib/user-action-errors'
import { RATE_LIMITED_MESSAGE, RateLimitError } from '../lib/rate-limit-error'

test('uses a safe generic user action error for internal failures', () => {
  const message = getUserActionErrorMessage(
    new Error('ไม่พบตัวแปรแวดล้อม MONGODB_URI')
  )

  assert.equal(message, USER_ACTION_ERROR_MESSAGE)
  assert.equal(message.includes('MONGODB_URI'), false)
  assert.equal(message.includes('secret'), false)
})

test('preserves user-facing validation and duplicate email messages', () => {
  const result = z
    .object({
      email: z.string().email('อีเมลไม่ถูกต้อง'),
    })
    .safeParse({ email: 'not-an-email' })

  assert.equal(result.success, false)
  if (!result.success) {
    assert.equal(
      getUserActionErrorMessage(result.error),
      'email: อีเมลไม่ถูกต้อง'
    )
  }

  assert.equal(
    getUserActionErrorMessage({
      code: 11000,
      keyValue: { email: 'buyer@example.com' },
    }),
    'email มีอยู่แล้วในระบบ'
  )
})

test('preserves the safe registration rate-limit message', () => {
  assert.equal(
    getUserActionErrorMessage(new RateLimitError()),
    RATE_LIMITED_MESSAGE
  )
})
