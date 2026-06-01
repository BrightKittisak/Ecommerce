import assert from 'node:assert/strict'
import test from 'node:test'

import { createHealthStatus } from '../lib/health'

test('creates a stable health status payload', () => {
  const status = createHealthStatus(new Date('2026-05-29T00:00:00.000Z'))

  assert.deepEqual(status, {
    ok: true,
    service: 'Lush',
    timestamp: '2026-05-29T00:00:00.000Z',
  })
})
