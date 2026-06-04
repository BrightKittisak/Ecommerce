import assert from 'node:assert/strict'
import test from 'node:test'

type LoadTestScript = typeof import('../scripts/perf/load-test.mjs')

let evaluateThresholds: LoadTestScript['evaluateThresholds']
let parseArgs: LoadTestScript['parseArgs']
let percentile: LoadTestScript['percentile']
let summarizeResults: LoadTestScript['summarizeResults']

const emptyEnv = { ...process.env, LOAD_TEST_BASE_URL: undefined }

test.before(async () => {
  const loadTestScript = await import('../scripts/perf/load-test.mjs')

  evaluateThresholds = loadTestScript.evaluateThresholds
  parseArgs = loadTestScript.parseArgs
  percentile = loadTestScript.percentile
  summarizeResults = loadTestScript.summarizeResults
})

test('parses load test options with safe defaults', () => {
  const options = parseArgs([], emptyEnv)

  assert.equal(options.baseUrl, 'http://localhost:3000')
  assert.equal(options.path, '/api/health')
  assert.equal(options.url, 'http://localhost:3000/api/health')
  assert.equal(options.concurrency, 10)
  assert.equal(options.durationSeconds, 30)
})

test('normalizes paths and accepts threshold gates', () => {
  const options = parseArgs(
    [
      '--url',
      'https://staging.example.com/shop',
      '--path',
      'search',
      '--concurrency',
      '25',
      '--duration',
      '60',
      '--warmup',
      '5',
      '--timeout',
      '3000',
      '--max-p95-ms',
      '800',
      '--max-failure-rate',
      '0.01',
    ],
    emptyEnv,
  )

  assert.equal(options.url, 'https://staging.example.com/search')
  assert.equal(options.concurrency, 25)
  assert.equal(options.durationSeconds, 60)
  assert.equal(options.warmupSeconds, 5)
  assert.equal(options.timeoutMs, 3000)
  assert.equal(options.maxP95Ms, 800)
  assert.equal(options.maxFailureRate, 0.01)
})

test('rejects invalid numeric flags', () => {
  assert.throws(
    () => parseArgs(['--concurrency', '0'], emptyEnv),
    /positive integer/,
  )
  assert.throws(
    () => parseArgs(['--max-failure-rate', '2'], emptyEnv),
    /number from 0 to 1/,
  )
})

test('calculates latency percentiles and result summaries', () => {
  assert.equal(percentile([100, 20, 40, 80], 50), 40)
  assert.equal(percentile([100, 20, 40, 80], 95), 100)

  const summary = summarizeResults(
    [
      { ok: true, status: 200, latencyMs: 20 },
      { ok: true, status: 200, latencyMs: 40 },
      { ok: false, status: 500, latencyMs: 100 },
    ],
    3,
  )

  assert.equal(summary.requests, 3)
  assert.equal(summary.ok, 2)
  assert.equal(summary.failed, 1)
  assert.equal(summary.failureRate, 0.3333)
  assert.equal(summary.requestsPerSecond, 1)
  assert.deepEqual(summary.statusCounts, { '200': 2, '500': 1 })
  assert.equal(summary.latencyMs.p95, 100)
})

test('reports threshold failures without enforcing default gates', () => {
  const summary = summarizeResults(
    [{ ok: false, status: 'ERR', latencyMs: 900 }],
    1,
  )

  assert.deepEqual(evaluateThresholds(summary, {}), [])
  assert.deepEqual(evaluateThresholds(summary, { maxP95Ms: 800 }), [
    'p95 900ms exceeded 800ms',
  ])
  assert.deepEqual(
    evaluateThresholds(summary, { maxFailureRate: 0.5 }),
    ['failure rate 1 exceeded 0.5'],
  )
})
