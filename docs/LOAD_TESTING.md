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

The command prints request counts, success and failure totals, request rate,
latency percentiles, and HTTP status counts.

## Recommended Scenarios

Use low-risk read endpoints first:

- `GET /api/health`
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

Use this runner as a gate for regressions and staging readiness. For the
100,000-concurrent-user goal, promote the same scenarios to a distributed tool
such as k6, Artillery, Locust, or a managed load-testing platform.
