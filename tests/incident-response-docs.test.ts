import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const runbook = readFileSync('docs/INCIDENT_RESPONSE.md', 'utf8')
const readme = readFileSync('README.md', 'utf8')
const normalizedRunbook = runbook.replace(/\s+/g, ' ')

test('documents production incident roles, probes, and closure evidence', () => {
  for (const requiredText of [
    'incident commander',
    'GET /api/health',
    'GET /api/ready',
    'Rollback Safety',
    'Evidence And Closure',
    'current release SHA',
  ]) {
    assert.equal(runbook.includes(requiredText), true, requiredText)
  }
})

test('uses observable production event names in dependency runbooks', () => {
  for (const event of [
    'health.readiness_failed',
    'stripe_webhook_invalid_signature',
    'stripe.purchase_receipt_failed',
    'paypal_api_error',
    'paypal_api_error_body_read_failed',
    'paypal.purchase_receipt_failed',
  ]) {
    assert.equal(runbook.includes(event), true, event)
  }
})

test('keeps unsafe payment and capacity actions out of incident response', () => {
  assert.equal(normalizedRunbook.includes('Never mark an order paid from browser state'), true)
  assert.equal(normalizedRunbook.includes('Never bypass it to clear a retry backlog'), true)
  assert.equal(normalizedRunbook.includes('failure rate exceeds 1%'), true)
  assert.equal(runbook.includes('docs/LOAD_TESTING.md'), true)
  assert.equal(readme.includes('docs/INCIDENT_RESPONSE.md'), true)
})
