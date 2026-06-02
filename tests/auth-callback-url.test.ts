import assert from 'node:assert/strict'
import test from 'node:test'

import { sanitizeAuthCallbackUrl } from '../lib/auth-callback-url'

test('allows internal auth callback paths', () => {
  assert.equal(sanitizeAuthCallbackUrl('/checkout'), '/checkout')
  assert.equal(
    sanitizeAuthCallbackUrl('/product/shirt?color=Blue'),
    '/product/shirt?color=Blue'
  )
})

test('rejects external and protocol-relative auth callback urls', () => {
  assert.equal(sanitizeAuthCallbackUrl('https://evil.example'), '/')
  assert.equal(sanitizeAuthCallbackUrl('//evil.example/path'), '/')
  assert.equal(sanitizeAuthCallbackUrl(' javascript:alert(1)'), '/')
})

test('falls back when auth callback url is empty', () => {
  assert.equal(sanitizeAuthCallbackUrl(undefined), '/')
  assert.equal(sanitizeAuthCallbackUrl(null), '/')
  assert.equal(sanitizeAuthCallbackUrl('   '), '/')
})
