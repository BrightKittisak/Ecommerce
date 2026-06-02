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
