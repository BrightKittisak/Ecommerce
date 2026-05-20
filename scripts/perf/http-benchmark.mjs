import { performance } from 'node:perf_hooks'

const baseUrl = process.env.BENCH_BASE_URL || 'http://localhost:3000'
const routes = (process.env.BENCH_ROUTES ||
  '/,/search?tag=new-arrival,/product/nike-mens-slim-fit-long-sleeve-t-shirt')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean)

function readPositiveIntegerEnv(name, fallback) {
  const rawValue = process.env[name]

  if (rawValue === undefined || rawValue.trim() === '') {
    return fallback
  }

  const parsedValue = Number(rawValue)
  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new Error(`${name} must be a positive integer. Received "${rawValue}".`)
  }

  return parsedValue
}

async function fetchOnce(route) {
  const startedAt = performance.now()
  const response = await fetch(`${baseUrl}${route}`)
  await response.text()

  return {
    ok: response.ok,
    ms: performance.now() - startedAt,
    status: response.status,
  }
}

async function warmRoute(route) {
  await fetchOnce(route)
}

async function benchRoute(route, { concurrency, requestsPerRoute }) {
  const durations = []
  let non200Count = 0

  for (let offset = 0; offset < requestsPerRoute; offset += concurrency) {
    const batchSize = Math.min(concurrency, requestsPerRoute - offset)
    const batch = await Promise.all(
      Array.from({ length: batchSize }, () => fetchOnce(route))
    )

    for (const result of batch) {
      durations.push(result.ms)
      if (!result.ok) non200Count += 1
    }
  }

  durations.sort((left, right) => left - right)
  const avg =
    durations.reduce((total, value) => total + value, 0) / durations.length
  const p95Index = Math.min(
    durations.length - 1,
    Math.max(0, Math.ceil(durations.length * 0.95) - 1)
  )

  return {
    route,
    requests: durations.length,
    concurrency,
    avgMs: Number(avg.toFixed(2)),
    p95Ms: Number(durations[p95Index].toFixed(2)),
    maxMs: Number(durations[durations.length - 1].toFixed(2)),
    non200Count,
  }
}

async function main() {
  const concurrency = readPositiveIntegerEnv('BENCH_CONCURRENCY', 20)
  const requestsPerRoute = readPositiveIntegerEnv('BENCH_REQUESTS', 20)

  for (const route of routes) {
    await warmRoute(route)
  }

  const results = []
  for (const route of routes) {
    results.push(await benchRoute(route, { concurrency, requestsPerRoute }))
  }

  console.log(JSON.stringify({ baseUrl, results }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
