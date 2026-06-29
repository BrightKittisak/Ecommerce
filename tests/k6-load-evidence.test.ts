import assert from 'node:assert/strict'
import test from 'node:test'

type EvidenceModule = typeof import('../scripts/perf/k6/load-evidence.mjs')

let createLoadTestEvidence: EvidenceModule['createLoadTestEvidence']
let validateLoadTestEvidence: EvidenceModule['validateLoadTestEvidence']

test.before(async () => {
  const evidenceModule = await import('../scripts/perf/k6/load-evidence.mjs')
  createLoadTestEvidence = evidenceModule.createLoadTestEvidence
  validateLoadTestEvidence = evidenceModule.validateLoadTestEvidence
})

function createEvidence(generatorId: string, executionSegment: string) {
  return createLoadTestEvidence({
    profile: {
      runId: 'capacity-2026-06-29',
      generatorId,
      executionSegment,
      baseUrl: 'https://staging.example.com',
      profileName: 'capacity',
      targetVus: 100000,
    },
    generatedAt: '2026-06-29T00:00:00.000Z',
    summary: {
      state: { testRunDurationMs: 1020000 },
      metrics: {
        checks: {
          type: 'rate',
          values: { rate: 0.999 },
          thresholds: { 'rate>0.99': { ok: true } },
        },
        vus_max: {
          type: 'gauge',
          values: { max: 25000 },
        },
      },
    },
  })
}

const expected = {
  runId: 'capacity-2026-06-29',
  baseUrl: 'https://staging.example.com',
  targetVus: 100000,
  generatorCount: 4,
}

test('creates compact evidence with a threshold verdict', () => {
  const evidence = createEvidence('generator-1', '0:1/4')

  assert.equal(evidence.schemaVersion, 1)
  assert.equal(evidence.result.thresholdsPassed, true)
  assert.equal(evidence.result.metrics.checks.values.rate, 0.999)
  assert.deepEqual(evidence.result.thresholds, [
    { metric: 'checks', expression: 'rate>0.99', passed: true },
  ])
})

test('accepts complete evidence from all distributed generators', () => {
  const report = validateLoadTestEvidence(
    [
      createEvidence('generator-1', '0:1/4'),
      createEvidence('generator-2', '1/4:2/4'),
      createEvidence('generator-3', '2/4:3/4'),
      createEvidence('generator-4', '3/4:1'),
    ],
    expected
  )

  assert.deepEqual(report, {
    passed: true,
    failures: [],
    generatorCount: 4,
    combinedMaxVus: 100000,
  })
})

test('rejects incomplete, duplicate, mismatched, or failed evidence', () => {
  const first = createEvidence('generator-1', '0:1/4')
  const duplicate = createEvidence('generator-1', '0:1/4')
  duplicate.run.id = 'different-run'
  duplicate.result.thresholdsPassed = false

  const report = validateLoadTestEvidence([first, duplicate], expected)

  assert.equal(report.passed, false)
  assert.equal(report.failures.some((failure) => failure.includes('expected 4')), true)
  assert.equal(report.failures.some((failure) => failure.includes('different run')), true)
  assert.equal(report.failures.some((failure) => failure.includes('thresholds')), true)
  assert.equal(report.failures.some((failure) => failure.includes('duplicate generator')), true)
  assert.equal(report.failures.some((failure) => failure.includes('duplicate execution')), true)
  assert.equal(report.failures.some((failure) => failure.includes('did not reach')), true)
})

test('rejects segments that leave a gap in the distributed partition', () => {
  const report = validateLoadTestEvidence(
    [
      createEvidence('generator-1', '0:1/4'),
      createEvidence('generator-2', '1/4:2/4'),
      createEvidence('generator-3', '3/4:7/8'),
      createEvidence('generator-4', '7/8:1'),
    ],
    expected
  )

  assert.equal(report.passed, false)
  assert.equal(
    report.failures.includes(
      'execution segments do not form one complete 0:1 partition'
    ),
    true
  )
})
