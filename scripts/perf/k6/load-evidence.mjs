export const LOAD_EVIDENCE_SCHEMA_VERSION = 1

const SEGMENT_BOUNDARY_PATTERN = /^(?:0|1|\d+\/\d+)$/

function parseSegmentBoundary(value) {
  if (!SEGMENT_BOUNDARY_PATTERN.test(value)) {
    throw new Error('execution segment boundaries must be 0, 1, or fractions')
  }

  if (!value.includes('/')) return Number(value)

  const [numerator, denominator] = value.split('/').map(Number)

  if (denominator <= 0 || numerator < 0 || numerator > denominator) {
    throw new Error('execution segment fractions must be between 0 and 1')
  }

  return numerator / denominator
}

export function parseExecutionSegment(value) {
  const boundaries = value.split(':')

  if (boundaries.length !== 2) {
    throw new Error('execution segment must use start:end syntax')
  }

  const start = parseSegmentBoundary(boundaries[0])
  const end = parseSegmentBoundary(boundaries[1])

  if (start >= end) {
    throw new Error('execution segment start must be lower than its end')
  }

  return { start, end }
}

function copyNumericValues(values = {}) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) =>
      Number.isFinite(value)
    )
  )
}

function summarizeMetrics(metrics = {}) {
  return Object.fromEntries(
    Object.entries(metrics).map(([name, metric]) => [
      name,
      {
        type: metric.type,
        values: copyNumericValues(metric.values),
        thresholds: Object.fromEntries(
          Object.entries(metric.thresholds ?? {}).map(
            ([expression, result]) => [expression, result.ok === true]
          )
        ),
      },
    ])
  )
}

function collectThresholds(metrics) {
  return Object.entries(metrics).flatMap(([metric, summary]) =>
    Object.entries(summary.thresholds).map(([expression, passed]) => ({
      metric,
      expression,
      passed,
    }))
  )
}

export function createLoadTestEvidence({
  summary,
  profile,
  generatedAt = new Date().toISOString(),
}) {
  const metrics = summarizeMetrics(summary.metrics)
  const thresholds = collectThresholds(metrics)

  return {
    schemaVersion: LOAD_EVIDENCE_SCHEMA_VERSION,
    run: {
      id: profile.runId,
      generatorId: profile.generatorId,
      executionSegment: profile.executionSegment,
      generatedAt,
      baseUrl: profile.baseUrl,
      profileName: profile.profileName,
      targetVus: profile.targetVus,
    },
    result: {
      thresholdsPassed:
        thresholds.length > 0 && thresholds.every(({ passed }) => passed),
      durationMs: summary.state?.testRunDurationMs ?? 0,
      thresholds,
      metrics,
    },
  }
}

function readMaxVus(evidence) {
  const values = evidence.result?.metrics?.vus_max?.values
  return values?.max ?? values?.value ?? 0
}

function thresholdsAreComplete(evidence) {
  const thresholds = evidence.result?.thresholds
  return (
    Array.isArray(thresholds) &&
    thresholds.length > 0 &&
    thresholds.every(({ passed }) => passed === true)
  )
}

export function validateLoadTestEvidence(evidenceList, expected) {
  const failures = []

  if (evidenceList.length !== expected.generatorCount) {
    failures.push(
      `expected ${expected.generatorCount} generator summaries, received ${evidenceList.length}`
    )
  }

  const generatorIds = new Set()
  const executionSegments = new Set()
  const segmentRanges = []
  let combinedMaxVus = 0

  for (const [index, evidence] of evidenceList.entries()) {
    const label = `summary ${index + 1}`

    if (evidence.schemaVersion !== LOAD_EVIDENCE_SCHEMA_VERSION) {
      failures.push(`${label} has an unsupported schema version`)
    }
    if (evidence.run?.id !== expected.runId) {
      failures.push(`${label} belongs to a different run`)
    }
    if (evidence.run?.baseUrl !== expected.baseUrl) {
      failures.push(`${label} targeted a different base URL`)
    }
    if (evidence.run?.targetVus !== expected.targetVus) {
      failures.push(`${label} used a different target VU count`)
    }
    if (
      evidence.result?.thresholdsPassed !== true ||
      !thresholdsAreComplete(evidence)
    ) {
      failures.push(`${label} did not pass all thresholds`)
    }
    if (!(evidence.result?.durationMs > 0)) {
      failures.push(`${label} has no measured duration`)
    }

    const generatorId = evidence.run?.generatorId
    const executionSegment = evidence.run?.executionSegment

    if (!generatorId || generatorIds.has(generatorId)) {
      failures.push(`${label} has a missing or duplicate generator ID`)
    }
    if (!executionSegment || executionSegments.has(executionSegment)) {
      failures.push(`${label} has a missing or duplicate execution segment`)
    } else {
      try {
        segmentRanges.push(parseExecutionSegment(executionSegment))
      } catch {
        failures.push(`${label} has an invalid execution segment`)
      }
    }

    generatorIds.add(generatorId)
    executionSegments.add(executionSegment)
    combinedMaxVus += readMaxVus(evidence)
  }

  segmentRanges.sort((left, right) => left.start - right.start)

  if (
    segmentRanges.length !== expected.generatorCount ||
    segmentRanges[0]?.start !== 0 ||
    segmentRanges[segmentRanges.length - 1]?.end !== 1 ||
    segmentRanges.some(
      (range, index) =>
        index > 0 && range.start !== segmentRanges[index - 1].end
    )
  ) {
    failures.push('execution segments do not form one complete 0:1 partition')
  }

  if (combinedMaxVus < expected.targetVus) {
    failures.push(
      `combined maximum VUs ${combinedMaxVus} did not reach ${expected.targetVus}`
    )
  }

  return {
    passed: failures.length === 0,
    failures,
    generatorCount: evidenceList.length,
    combinedMaxVus,
  }
}
