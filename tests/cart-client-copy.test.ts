import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  CART_ADD_BUTTON_LABEL,
  CART_BUY_NOW_LABEL,
  CART_CLIENT_ERROR_MESSAGE,
  getCartClientErrorMessage,
} from '../lib/cart-client-copy'

test('uses localized safe cart client copy', () => {
  assert.equal(CART_ADD_BUTTON_LABEL, 'เพิ่มลงตะกร้า')
  assert.equal(CART_BUY_NOW_LABEL, 'ซื้อเลย')
  assert.equal(getCartClientErrorMessage(), CART_CLIENT_ERROR_MESSAGE)
  assert.equal(CART_CLIENT_ERROR_MESSAGE.includes('Something went wrong'), false)
  assert.equal(CART_CLIENT_ERROR_MESSAGE.includes('MONGODB_URI'), false)
})

test('does not render English or raw error copy in add-to-cart controls', () => {
  const source = readFileSync('components/shared/product/add-to-cart.tsx', 'utf8')

  assert.equal(source.includes('Add to Cart'), false)
  assert.equal(source.includes('Something went wrong'), false)
  assert.equal(source.includes('error.message'), false)
  assert.equal(source.includes('getCartClientErrorMessage()'), true)
})
