import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync('app/api/ready/route.ts', 'utf8')

test('readiness route is private, dynamic, and delegates dependency checks', () => {
  assert.equal(source.includes("dynamic = 'force-dynamic'"), true)
  assert.equal(source.includes("'Cache-Control': 'no-store'"), true)
  assert.equal(source.includes('deps: mongoReadinessDeps'), true)
  assert.equal(source.includes("logger.error('health.readiness_failed'"), true)
  assert.equal(source.includes('error: serializeLogError(error)'), true)
  assert.equal(source.includes("from '@/lib/db'"), false)
  assert.equal(source.includes('error.message'), false)
})
