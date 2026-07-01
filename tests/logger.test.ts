import assert from 'node:assert/strict'
import test from 'node:test'

import { logger, serializeLogError } from '../lib/logger'

test('serializes standard errors for structured logs', () => {
  assert.deepEqual(serializeLogError(new Error('Receipt failed')), {
    name: 'Error',
    message: 'Receipt failed',
  })
})

test('serializes string and unknown errors without dumping objects', () => {
  assert.deepEqual(serializeLogError('Plain failure'), {
    message: 'Plain failure',
  })
  assert.deepEqual(serializeLogError({ token: 'secret' }), {
    message: 'Unknown error',
  })
})

test('redacts URI credentials from error messages and strings', () => {
  const message =
    'Failed mongodb://admin:database-secret@database.internal/shop'

  assert.deepEqual(serializeLogError(new Error(message)), {
    name: 'Error',
    message:
      'Failed mongodb://[REDACTED]@database.internal/shop',
  })
  assert.deepEqual(serializeLogError(message), {
    message:
      'Failed mongodb://[REDACTED]@database.internal/shop',
  })
})

test('writes warnings without allowing metadata to override reserved fields', () => {
  const messages: string[] = []
  const originalWarn = console.warn
  console.warn = (message) => messages.push(String(message))

  try {
    logger.warn('auth.registration_rate_limited', {
      level: 'error',
      event: 'spoofed',
      timestamp: 'spoofed',
      operation: 'action:user-registration',
    })
  } finally {
    console.warn = originalWarn
  }

  assert.equal(messages.length, 1)
  const entry = JSON.parse(messages[0])
  assert.equal(entry.level, 'warn')
  assert.equal(entry.event, 'auth.registration_rate_limited')
  assert.notEqual(entry.timestamp, 'spoofed')
  assert.equal(entry.operation, 'action:user-registration')
})
