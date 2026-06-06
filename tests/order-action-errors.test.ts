import assert from 'node:assert/strict'
import test from 'node:test'
import { z } from 'zod'

import {
  getOrderActionErrorMessage,
  ORDER_ACTION_ERROR_MESSAGE,
} from '../lib/order-action-errors'

test('uses a safe generic order action error for internal failures', () => {
  const message = getOrderActionErrorMessage(
    new Error('database write failed with connection details')
  )

  assert.equal(message, ORDER_ACTION_ERROR_MESSAGE)
  assert.equal(message.includes('database'), false)
  assert.equal(message.includes('MONGODB_URI'), false)
})

test('preserves order validation and domain messages', () => {
  const result = z
    .object({
      paymentMethod: z.string().min(1, 'กรุณาเลือกวิธีชำระเงิน'),
    })
    .safeParse({ paymentMethod: '' })

  assert.equal(result.success, false)
  if (!result.success) {
    assert.equal(
      getOrderActionErrorMessage(result.error),
      'paymentMethod: กรุณาเลือกวิธีชำระเงิน'
    )
  }

  assert.equal(
    getOrderActionErrorMessage(
      new Error('สินค้า Studio Bag มีในสต็อกไม่เพียงพอ')
    ),
    'สินค้า Studio Bag มีในสต็อกไม่เพียงพอ'
  )
})
