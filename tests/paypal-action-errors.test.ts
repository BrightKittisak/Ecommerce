import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getPayPalActionErrorMessage,
  PAYPAL_ACTION_ERROR_MESSAGE,
} from '../lib/paypal-action-errors'

test('uses a safe caller-facing PayPal action error', () => {
  const message = getPayPalActionErrorMessage(
    new Error('PayPal debug_id=abc123 secret leaked')
  )

  assert.equal(message, PAYPAL_ACTION_ERROR_MESSAGE)
  assert.equal(message.includes('debug_id'), false)
  assert.equal(message.includes('MONGODB_URI'), false)
  assert.equal(message.includes('secret'), false)
})

test('preserves safe PayPal action domain errors', () => {
  assert.equal(
    getPayPalActionErrorMessage(new Error('กรุณาเข้าสู่ระบบก่อนทำรายการ')),
    'กรุณาเข้าสู่ระบบก่อนทำรายการ'
  )
  assert.equal(
    getPayPalActionErrorMessage(new Error('ไม่พบคำสั่งซื้อ')),
    'ไม่พบคำสั่งซื้อ'
  )
  assert.equal(
    getPayPalActionErrorMessage(
      new Error('รายการชำระเงิน PayPal ไม่ตรงกับคำสั่งซื้อนี้')
    ),
    'รายการชำระเงิน PayPal ไม่ตรงกับคำสั่งซื้อนี้'
  )
})
