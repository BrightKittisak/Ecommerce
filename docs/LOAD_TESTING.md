# Load Testing

This project includes a small dependency-free load-test runner for repeatable
smoke and staging checks. It is not a substitute for a distributed load platform,
but it gives the team a consistent baseline before spending money on larger
tests.

## Quick Start

Start the app in one terminal:

```bash
npm run dev
```

Run a measured health check in another terminal:

```bash
npm run load:test -- --path /api/health --concurrency 50 --duration 60
```

Run against staging:

```bash
npm run load:test -- --url https://staging.example.com --path /search --concurrency 100 --duration 120 --warmup 10 --max-p95-ms 800 --max-failure-rate 0.01
```

Run the default health gate before a release candidate:

```bash
npm run load:test:gate -- --url https://staging.example.com
```

The command prints request counts, success and failure totals, request rate,
latency percentiles, and HTTP status counts.

## Gates

Use threshold gates for repeatable release checks:

- `--max-p95-ms`: fails when p95 latency is above the budget.
- `--max-failure-rate`: fails when the measured failure rate is above the budget.
- `--min-rps`: fails when measured throughput is below the minimum.
- `--min-requests`: fails when the measured request count is below the minimum.

The npm `load:test:gate` script is the default low-risk smoke gate for
`GET /api/health`. Override `--url` for staging, and raise or lower the gates
per endpoint based on historical baselines.

## Recommended Scenarios

Use low-risk read endpoints first:

- `GET /api/health`
- `GET /api/ready` at low concurrency to verify database readiness.
- `GET /`
- `GET /search`
- `GET /product/{slug}`

Use write endpoints only in a controlled seeded environment:

- Checkout/order creation with test accounts and test payment data.
- Webhooks only with provider test mode and replay-safe fixtures.
- Admin paths only after confirming authorization and rate limits.

## Safety Rules

Never run high-concurrency tests against production without explicit approval,
a rollback owner, and monitoring open. A single developer machine cannot prove
support for 100,000 concurrent users; that target needs distributed load
generation, database capacity planning, CDN/cache strategy, queueing, rate
limits, and provider quota checks.

Use `/api/health` for high-frequency liveness and load-generator checks because
it does not call dependencies. Use `/api/ready` for deployment readiness and
low-frequency monitoring only; each request includes a database ping and returns
HTTP 503 when the database is unavailable or the two-second application timeout
is exceeded.

Use this runner as a gate for regressions and staging readiness. For the
100,000-concurrent-user goal, promote the same scenarios to a distributed tool
such as k6, Artillery, Locust, or a managed load-testing platform. Keep the
same latency, failure-rate, and throughput budgets so local smoke checks and
distributed tests measure the same production risks.
