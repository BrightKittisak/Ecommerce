import assert from 'node:assert/strict'
import test from 'node:test'

import { securityHeaders } from '../lib/security-headers'

const getHeader = (name: string) =>
  securityHeaders.find((header) => header.key === name)?.value

test('declares production security headers for every route', () => {
  assert.equal(getHeader('Strict-Transport-Security'), 'max-age=63072000; includeSubDomains; preload')
  assert.equal(getHeader('X-Content-Type-Options'), 'nosniff')
  assert.equal(getHeader('X-Frame-Options'), 'DENY')
  assert.equal(getHeader('Referrer-Policy'), 'strict-origin-when-cross-origin')
  assert.equal(getHeader('Cross-Origin-Opener-Policy'), 'same-origin')
})

test('keeps a conservative permissions policy while allowing payments', () => {
  assert.equal(
    getHeader('Permissions-Policy'),
    'camera=(), microphone=(), geolocation=(), payment=(self)'
  )
})

test('defines a CSP baseline compatible with Next.js, Stripe, and PayPal', () => {
  const csp = getHeader('Content-Security-Policy')

  assert.ok(csp?.includes("default-src 'self'"))
  assert.ok(csp?.includes("object-src 'none'"))
  assert.ok(csp?.includes("frame-ancestors 'none'"))
  assert.ok(csp?.includes("script-src 'self' 'unsafe-inline' 'unsafe-eval'"))
  assert.ok(csp?.includes('https://js.stripe.com'))
  assert.ok(csp?.includes('https://www.paypal.com'))
  assert.ok(csp?.includes('https://www.sandbox.paypal.com'))
  assert.ok(csp?.includes('upgrade-insecure-requests'))
})
