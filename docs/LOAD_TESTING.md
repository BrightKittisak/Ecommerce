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

## Distributed k6 Scenario

Install k6 separately, then run the read-only smoke profile against staging:

```powershell
$env:BASE_URL='https://staging.example.com'
$env:PRODUCT_SLUG='known-published-product'
npm run load:test:k6
```

The script defaults to 50 virtual users with a three-second think time. It
mixes health, home, search, and optional product-detail reads. It excludes
checkout, writes, webhooks, admin routes, and `/api/ready`.

Tests above 1,000 virtual users are locked unless the operator explicitly sets
`LARGE_TEST_APPROVED=true`. Before any 100,000-VU test, pass 1%, 10%, 25%, and
50% capacity stages, verify dashboards and quotas, and record a rollback owner.

For a four-generator 100,000-VU capacity run, configure the same environment on
every generator:

```powershell
$env:BASE_URL='https://staging.example.com'
$env:PRODUCT_SLUG='known-published-product'
$env:TARGET_VUS='100000'
$env:LOAD_PROFILE='capacity'
$env:LARGE_TEST_APPROVED='true'
$env:RUN_ID='capacity-2026-06-29'
```

Set a unique generator ID, matching execution-segment metadata, and summary path
on each synchronized generator before running its non-overlapping segment. The
metadata does not control k6 segmentation; it records the exact CLI segment in
the evidence artifact.

```powershell
$env:GENERATOR_ID='generator-1'
$env:EXECUTION_SEGMENT='0:1/4'
$env:SUMMARY_PATH='artifacts/generator-1.json'
k6 run --execution-segment "0:1/4" --execution-segment-sequence "0,1/4,2/4,3/4,1" scripts/perf/k6/distributed-read.js
```

Repeat with `generator-2` and `1/4:2/4`, `generator-3` and `2/4:3/4`, then
`generator-4` and `3/4:1`. Collect the four JSON files into one directory and
validate them before accepting the run:

```powershell
npm run load:test:evidence -- --dir artifacts/capacity-2026-06-29 --run-id capacity-2026-06-29 --base-url https://staging.example.com --target-vus 100000 --expected-generators 4
```

k6 scales VUs for each execution segment, so the combined target remains
100,000 rather than 100,000 per generator. Four generators are only a starting
topology; benchmark generator CPU, memory, network, and dropped iterations
before trusting results. See the official [large-test guide](https://grafana.com/docs/k6/latest/testing-guides/running-large-tests/),
[execution-segment options](https://grafana.com/docs/k6/latest/using-k6/k6-options/reference/#execution-segment),
and [threshold documentation](https://grafana.com/docs/k6/latest/using-k6/thresholds/).

The run passes only when checks exceed 99%, HTTP failures remain below 1%, and
endpoint p95 latency stays within the script thresholds. Archive the k6 summary,
application metrics, MongoDB saturation, CDN hit ratio, provider quota usage,
and incident timeline as evidence. Without that evidence, do not claim the
system supports 100,000 concurrent users.

The evidence validator also requires every generator summary to belong to the
same run and target, use a unique identity and segment, pass all k6 thresholds,
contain a measured duration, and collectively report at least the target VU
count. This validates test artifacts, not infrastructure dashboards or provider
quotas; those remain mandatory operator evidence.
