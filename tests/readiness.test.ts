import assert from 'node:assert/strict'
import test from 'node:test'

import { checkReadiness } from '../lib/application/health/readiness'

const now = () => new Date('2026-06-28T00:00:00.000Z')

test('reports ready when the database check succeeds', async () => {
  let checks = 0
  const result = await checkReadiness({
    deps: {
      async checkDatabase() {
        checks += 1
      },
    },
    now,
  })

  assert.equal(checks, 1)
  assert.deepEqual(result, {
    status: 200,
    body: {
      ready: true,
      service: 'Lush',
      checks: { database: 'up' },
      timestamp: '2026-06-28T00:00:00.000Z',
    },
  })
})

test('reports not ready without exposing database errors', async () => {
  const result = await checkReadiness({
    deps: {
      async checkDatabase() {
        throw new Error('mongodb://user:secret@database.internal')
      },
    },
    now,
  })

  assert.deepEqual(result, {
    status: 503,
    body: {
      ready: false,
      service: 'Lush',
      checks: { database: 'down' },
      timestamp: '2026-06-28T00:00:00.000Z',
    },
  })
  assert.equal(JSON.stringify(result).includes('secret'), false)
})

test('reports not ready when the database check exceeds its timeout', async () => {
  const result = await checkReadiness({
    deps: {
      checkDatabase: () => new Promise(() => undefined),
    },
    now,
    timeoutMs: 1,
  })

  assert.equal(result.status, 503)
  assert.equal(result.body.ready, false)
  assert.equal(result.body.checks.database, 'down')
})
