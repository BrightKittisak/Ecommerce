import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync('scripts/perf/k6/distributed-read.js', 'utf8')

test('distributed load scenario stays read-only and excludes dependency probes', () => {
  assert.equal(source.includes('http.get('), true)
  assert.equal(source.includes('http.post('), false)
  assert.equal(source.includes('/checkout'), false)
  assert.equal(source.includes('/api/ready'), false)
})

test('distributed load scenario enforces latency and error thresholds', () => {
  assert.equal(source.includes("http_req_failed: ['rate<0.01']"), true)
  assert.equal(source.includes("checks: ['rate>0.99']"), true)
  assert.equal(source.includes('p(95)<1000'), true)
  assert.equal(source.includes("executor: 'ramping-vus'"), true)
})
