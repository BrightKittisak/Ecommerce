#!/usr/bin/env node

import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'

export const DEFAULTS = {
  concurrency: 10,
  durationSeconds: 30,
  timeoutMs: 5000,
  warmupSeconds: 0,
  method: 'GET',
  path: '/api/health',
}

function printHelp() {
  console.log(`Usage:
  node scripts/perf/load-test.mjs --url http://localhost:3000 [options]

Options:
  --url <url>                 Base URL. Defaults to LOAD_TEST_BASE_URL or http://localhost:3000.
  --path <path>               Request path. Default: /api/health.
  --method <method>           HTTP method. Default: GET.
  --concurrency <number>      Number of concurrent workers. Default: 10.
  --duration <seconds>        Measured run duration. Default: 30.
  --warmup <seconds>          Warmup duration before measuring. Default: 0.
  --timeout <milliseconds>    Per-request timeout. Default: 5000.
  --max-p95-ms <milliseconds> Optional p95 latency gate.
  --max-failure-rate <number> Optional failure-rate gate from 0 to 1.
  --help                      Show this help.

Examples:
  npm run load:test -- --path /api/health --concurrency 50 --duration 60
  npm run load:test -- --url https://staging.example.com --path /search --max-p95-ms 800
`)
}

function parsePositiveInteger(value, name) {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`)
  }

  return parsed
}

function parseNonNegativeInteger(value, name) {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer`)
  }

  return parsed
}

function parseOptionalRate(value, name) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    throw new Error(`${name} must be a number from 0 to 1`)
  }

  return parsed
}

function readFlag(args, index, flag) {
  const value = args[index + 1]

  if (!value || value.startsWith('--')) {
    throw new Error(`${flag} requires a value`)
  }

  return value
}

export function parseArgs(argv = process.argv.slice(2), env = process.env) {
  const options = {
    ...DEFAULTS,
    baseUrl: env.LOAD_TEST_BASE_URL || 'http://localhost:3000',
    url: '',
    maxP95Ms: undefined,
    maxFailureRate: undefined,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]

    if (flag === '--help' || flag === '-h') {
      options.help = true
      continue
    }

    if (flag === '--url') {
      options.baseUrl = readFlag(argv, index, flag)
      index += 1
      continue
    }

    if (flag === '--path') {
      options.path = readFlag(argv, index, flag)
      index += 1
      continue
    }

    if (flag === '--method') {
      options.method = readFlag(argv, index, flag).toUpperCase()
      index += 1
      continue
    }

    if (flag === '--concurrency') {
      options.concurrency = parsePositiveInteger(readFlag(argv, index, flag), flag)
      index += 1
      continue
    }

    if (flag === '--duration') {
      options.durationSeconds = parsePositiveInteger(readFlag(argv, index, flag), flag)
      index += 1
      continue
    }

    if (flag === '--warmup') {
      options.warmupSeconds = parseNonNegativeInteger(readFlag(argv, index, flag), flag)
      index += 1
      continue
    }

    if (flag === '--timeout') {
      options.timeoutMs = parsePositiveInteger(readFlag(argv, index, flag), flag)
      index += 1
      continue
    }

    if (flag === '--max-p95-ms') {
      options.maxP95Ms = parsePositiveInteger(readFlag(argv, index, flag), flag)
      index += 1
      continue
    }

    if (flag === '--max-failure-rate') {
      options.maxFailureRate = parseOptionalRate(readFlag(argv, index, flag), flag)
      index += 1
      continue
    }

    throw new Error(`Unknown option: ${flag}`)
  }

  if (!options.path.startsWith('/')) {
    options.path = `/${options.path}`
  }

  options.url = new URL(options.path, options.baseUrl).toString()

  return options
}

export function percentile(values, percentileRank) {
  if (values.length === 0) {
    return 0
  }

  const sorted = [...values].sort((left, right) => left - right)
  const index = Math.ceil((percentileRank / 100) * sorted.length) - 1

  return sorted[Math.max(0, Math.min(sorted.length - 1, index))]
}

function roundNumber(value, decimals = 2) {
  return Number(value.toFixed(decimals))
}

export function summarizeResults(results, durationSeconds) {
  const measuredDurationSeconds = Math.max(durationSeconds, 0.001)
  const latencies = results.map((result) => result.latencyMs)
  const ok = results.filter((result) => result.ok).length
  const failed = results.length - ok
  const statusCounts = {}

  for (const result of results) {
    const key = String(result.status || 'ERR')
    statusCounts[key] = (statusCounts[key] || 0) + 1
  }

  const totalLatency = latencies.reduce((sum, latency) => sum + latency, 0)

  return {
    requests: results.length,
    ok,
    failed,
    failureRate: results.length === 0 ? 0 : roundNumber(failed / results.length, 4),
    requestsPerSecond: roundNumber(results.length / measuredDurationSeconds),
    latencyMs: {
      avg: latencies.length === 0 ? 0 : roundNumber(totalLatency / latencies.length),
      p50: roundNumber(percentile(latencies, 50)),
      p95: roundNumber(percentile(latencies, 95)),
      p99: roundNumber(percentile(latencies, 99)),
      max: roundNumber(latencies.length === 0 ? 0 : Math.max(...latencies)),
    },
    statusCounts,
  }
}

export function evaluateThresholds(summary, options) {
  const failures = []

  if (options.maxP95Ms !== undefined && summary.latencyMs.p95 > options.maxP95Ms) {
    failures.push(`p95 ${summary.latencyMs.p95}ms exceeded ${options.maxP95Ms}ms`)
  }

  if (
    options.maxFailureRate !== undefined &&
    summary.failureRate > options.maxFailureRate
  ) {
    failures.push(
      `failure rate ${summary.failureRate} exceeded ${options.maxFailureRate}`,
    )
  }

  return failures
}

async function requestOnce(options, measured) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs)
  const startedAt = performance.now()

  try {
    const response = await fetch(options.url, {
      method: options.method,
      signal: controller.signal,
      headers: {
        'user-agent': 'ecommerce-load-test/1.0',
      },
    })

    return {
      measured,
      ok: response.ok,
      status: response.status,
      latencyMs: performance.now() - startedAt,
    }
  } catch {
    return {
      measured,
      ok: false,
      status: 'ERR',
      latencyMs: performance.now() - startedAt,
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function runWorkers(options) {
  const warmupUntil = performance.now() + options.warmupSeconds * 1000
  const runUntil = warmupUntil + options.durationSeconds * 1000
  const measuredResults = []

  async function worker() {
    while (performance.now() < runUntil) {
      const measured = performance.now() >= warmupUntil
      const result = await requestOnce(options, measured)

      if (result.measured) {
        measuredResults.push(result)
      }
    }
  }

  await Promise.all(
    Array.from({ length: options.concurrency }, () => worker()),
  )

  return measuredResults
}

async function main() {
  let options

  try {
    options = parseArgs()
  } catch (error) {
    console.error(error.message)
    printHelp()
    process.exitCode = 1
    return
  }

  if (options.help) {
    printHelp()
    return
  }

  console.log(
    `Running ${options.method} ${options.url} for ${options.durationSeconds}s with ${options.concurrency} workers`,
  )

  if (options.warmupSeconds > 0) {
    console.log(`Warmup: ${options.warmupSeconds}s`)
  }

  const results = await runWorkers(options)
  const summary = summarizeResults(results, options.durationSeconds)
  const thresholdFailures = evaluateThresholds(summary, options)

  console.log(JSON.stringify(summary, null, 2))

  if (thresholdFailures.length > 0) {
    console.error(`Threshold failures: ${thresholdFailures.join('; ')}`)
    process.exitCode = 1
  }
}

const currentFile = fileURLToPath(import.meta.url)

if (process.argv[1] === currentFile) {
  main()
}
