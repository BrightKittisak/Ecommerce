import assert from 'node:assert/strict'
import test from 'node:test'

import { isAuthorizedPathAccessAllowed } from '../lib/auth-authorization'

test('allows public paths without a session', () => {
  assert.equal(
    isAuthorizedPathAccessAllowed({
      pathname: '/product/shirt',
      isAuthenticated: false,
    }),
    true
  )
})

test('requires a session for account and checkout paths', () => {
  for (const pathname of ['/account', '/account/orders', '/checkout']) {
    assert.equal(
      isAuthorizedPathAccessAllowed({
        pathname,
        isAuthenticated: false,
      }),
      false
    )
    assert.equal(
      isAuthorizedPathAccessAllowed({
        pathname,
        isAuthenticated: true,
      }),
      true
    )
  }
})

test('requires a session for admin paths', () => {
  assert.equal(
    isAuthorizedPathAccessAllowed({
      pathname: '/admin/overview',
      isAuthenticated: false,
    }),
    false
  )
  assert.equal(
    isAuthorizedPathAccessAllowed({
      pathname: '/admin/overview',
      isAuthenticated: true,
    }),
    true
  )
})
