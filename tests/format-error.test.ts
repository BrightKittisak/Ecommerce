import assert from 'node:assert/strict'
import test from 'node:test'
import { z } from 'zod'

import { formatError } from '../lib/utils'

test('formats zod validation errors with field paths', () => {
  const result = z
    .object({
      email: z.string().email('Email is invalid'),
    })
    .safeParse({ email: 'not-an-email' })

  assert.equal(result.success, false)
  if (!result.success) {
    assert.equal(formatError(result.error), 'email: Email is invalid')
  }
})

test('formats mongoose-style validation errors', () => {
  assert.equal(
    formatError({
      name: 'ValidationError',
      errors: {
        name: { message: 'Name is required' },
        email: { message: 'Email is invalid' },
      },
    }),
    'Name is required. Email is invalid'
  )
})

test('formats duplicate key errors', () => {
  assert.equal(
    formatError({
      code: 11000,
      keyValue: {
        email: 'buyer@example.com',
      },
    }),
    'email มีอยู่แล้วในระบบ'
  )
})

test('formats standard errors, strings, and unknown values', () => {
  assert.equal(formatError(new Error('Something failed')), 'Something failed')
  assert.equal(formatError('Plain failure'), 'Plain failure')
  assert.equal(formatError({ unexpected: true }), 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ')
})
