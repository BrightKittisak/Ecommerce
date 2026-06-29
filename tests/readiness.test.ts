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
  const failures: unknown[] = []
  const result = await checkReadiness({
    deps: {
      async checkDatabase() {
        throw new Error('mongodb://user:secret@database.internal')
      },
    },
    now,
    onFailure: (failure) => failures.push(failure),
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
  assert.equal(failures.length, 1)
  assert.deepEqual(failures[0], {
    check: 'database',
    error: new Error('mongodb://user:secret@database.internal'),
    timedOut: false,
    timeoutMs: 2000,
  })
})

test('reports not ready when the database check exceeds its timeout', async () => {
  let failure: { timedOut: boolean; timeoutMs: number } | undefined
  const result = await checkReadiness({
    deps: {
      checkDatabase: () => new Promise(() => undefined),
    },
    now,
    timeoutMs: 1,
    onFailure: (readinessFailure) => {
      failure = readinessFailure
    },
  })

  assert.equal(result.status, 503)
  assert.equal(result.body.ready, false)
  assert.equal(result.body.checks.database, 'down')
  assert.equal(failure?.timedOut, true)
  assert.equal(failure?.timeoutMs, 1)
})

test('keeps readiness response stable when failure reporting throws', async () => {
  const result = await checkReadiness({
    deps: {
      async checkDatabase() {
        throw new Error('Database unavailable')
      },
    },
    now,
    onFailure: () => {
      throw new Error('Logger unavailable')
    },
  })

  assert.equal(result.status, 503)
  assert.equal(result.body.ready, false)
})
