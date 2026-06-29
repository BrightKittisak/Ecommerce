import assert from 'node:assert/strict'
import test from 'node:test'

import {
  AUTH_USER_FALLBACK_NAME,
  getAuthUserDisplayName,
} from '../lib/auth-user-display-name'

test('prefers a trimmed auth user name', () => {
  assert.equal(
    getAuthUserDisplayName({ name: '  Kitti  ', email: 'other@example.com' }),
    'Kitti'
  )
})

test('falls back to the email local part when the name is missing', () => {
  assert.equal(
    getAuthUserDisplayName({ name: null, email: 'customer@example.com' }),
    'customer'
  )
})

test('uses a stable fallback when both auth name and email are missing', () => {
  assert.equal(
    getAuthUserDisplayName({ name: null, email: null }),
    AUTH_USER_FALLBACK_NAME
  )
})
