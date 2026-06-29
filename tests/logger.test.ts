import assert from 'node:assert/strict'
import test from 'node:test'

import { serializeLogError } from '../lib/logger'

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
