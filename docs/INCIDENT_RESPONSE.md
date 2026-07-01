# Production Incident Response

This runbook is the operational contract for production incidents. It is
provider-neutral so it can be used with the selected hosting, logging, paging,
and database platforms.

Documentation is not monitoring. Before a production launch, an owner must
connect the signals below to dashboards and paging, test every notification,
and record the dashboard and provider-console links in the private operations
system. Do not commit credentials or private incident links here.

## Severity And Roles

| Severity | Definition | Initial response |
| --- | --- | --- |
| SEV-1 | Checkout is unsafe, payment state may be wrong, or most customers cannot use the storefront | Page immediately; assign incident commander and operations lead |
| SEV-2 | A major dependency or customer flow is degraded without known data corruption | Page the on-call owner within 15 minutes |
| SEV-3 | Limited degradation with a safe workaround and no payment or data-integrity risk | Triage during the support window |

Every SEV-1 and SEV-2 incident needs one incident commander, one operations
lead, and one communications owner. The incident commander owns decisions and
the timeline; responders should not make competing production changes.

## First Ten Minutes

1. Open an incident record with UTC start time, current release SHA, severity,
   affected flows, and the person acting as incident commander.
2. Freeze deployments and unrelated configuration changes.
3. Check `GET /api/health` and `GET /api/ready` from more than one location.
4. Compare error rate, p95 and p99 latency, request volume, MongoDB saturation,
   and payment-provider status against the last healthy period.
5. Preserve logs and provider delivery IDs. Never paste credentials, raw
   authorization headers, webhook secrets, or full customer records.
6. Choose one mitigation, record the expected result, and observe it before
   starting another change.

`/api/health` is dependency-free liveness. `/api/ready` performs a database
check and returns HTTP 503 when MongoDB is unavailable or its application
timeout is exceeded. A healthy liveness probe with failing readiness usually
indicates a dependency problem; both failing usually indicates an application
or hosting problem.

## Required Alert Wiring

These are starting thresholds. Tune them from production baselines without
silencing payment-integrity or availability signals.

| Signal | Initial trigger | Severity |
| --- | --- | --- |
| `/api/health` non-200 | Two consecutive checks from two locations | SEV-1 |
| `/api/ready` HTTP 503 | Three consecutive checks or 5 minutes sustained | SEV-2; SEV-1 when checkout fails |
| `health.readiness_failed` | Sustained increase over 5 minutes | SEV-2 |
| Storefront or checkout 5xx rate | Above 1% for 5 minutes | SEV-2; SEV-1 above 5% |
| Checkout p95 latency | Above 1,000 ms for 10 minutes | SEV-2 |
| `stripe_webhook_invalid_signature` | Sudden increase above established baseline | SEV-2 security investigation |
| Stripe webhook delivery failures | Any sustained failure or provider retry backlog | SEV-1 when payment updates are delayed |
| `paypal_api_error` or `paypal_api_error_body_read_failed` | Sustained increase over 5 minutes | SEV-2 |
| `stripe.purchase_receipt_failed` or `paypal.purchase_receipt_failed` | Any occurrence | SEV-3; payment remains authoritative |
| `auth.sign_in_rate_limited` or `auth.registration_rate_limited` | Sustained increase above baseline | SEV-2 security investigation |
| `api.browsing_history_rate_limited` | Sustained increase above baseline | SEV-3; SEV-2 with customer impact |
| MongoDB connection, CPU, memory, or pool saturation | Above provider safe range for 10 minutes | SEV-2 |
| CDN cache hit ratio | Material drop from the accepted load-test baseline | SEV-2 during traffic pressure |

Rate-limit responses and records must also be graphed by operation. A rise in
sign-in failures, registration limits, or HTTP 429 responses may indicate abuse
or a broken client. Rate-limit data must not contain raw email addresses or IPs.

## Database Or Readiness Failure

### Confirm

1. Compare `/api/health` with `/api/ready` and inspect
   `health.readiness_failed` fields `check`, `timedOut`, and `timeoutMs`.
2. Check MongoDB provider status, active connections, pool wait time, query
   latency, CPU, memory, storage, and network access changes.
3. Correlate the first failure with deployments, index changes, traffic spikes,
   and scheduled jobs.

### Contain

1. Stop deployments, seeds, migrations, and currency synchronization jobs.
2. Preserve cacheable browse traffic at the CDN and shed nonessential dynamic
   traffic at the WAF or hosting layer.
3. Do not blindly add application instances when the database connection pool
   is saturated; that can increase the outage.
4. Roll back the latest release when failures began with that release and the
   rollback does not revert payment or order data.

### Recover

Readiness must remain HTTP 200 for at least 10 minutes, database saturation must
return below its safe operating range, and checkout smoke tests must pass before
closing mitigation. Re-enable background jobs one at a time.

## Stripe Webhook Or Payment Failure

### Confirm

1. Check Stripe service status and webhook delivery history. Record event IDs,
   delivery attempts, response codes, and the first affected time.
2. Separate invalid signatures from valid events that failed during order
   processing. `stripe_webhook_invalid_signature` is a verification failure;
   `stripe.purchase_receipt_failed` occurs after payment processing and does not
   mean the payment failed.
3. Reconcile Stripe payment intent state against the local order using provider
   IDs. Never mark an order paid from browser state or an unverified payload.

### Contain And Recover

1. If invalid-signature failures started after secret rotation, restore the
   matching endpoint secret through the secret manager and redeploy safely.
2. Keep webhook signature verification enabled. Never bypass it to clear a
   retry backlog.
3. Replay only provider-verified events and preserve event IDs. The payment
   workflow is idempotent, but confirm the existing order state before replay.
4. If only receipt delivery failed, queue or perform a controlled receipt retry;
   do not change payment status or increment sales again.
5. Close only after the provider retry backlog is empty and a test-mode payment
   completes through webhook verification and order reconciliation.

## PayPal Failure

1. Correlate `paypal_api_error` and `paypal_api_error_body_read_failed` with
   PayPal status, HTTP status metadata, token creation, order creation, and
   capture operations.
2. Confirm captures in PayPal before changing local order state. Never trust the
   browser approval callback as payment proof.
3. Do not repeatedly capture the same order manually. Use the stored PayPal
   order ID and the idempotent application flow.
4. Treat `paypal.purchase_receipt_failed` as a receipt incident, not a payment
   failure. Retry only the receipt side effect.
5. Recover when sandbox or production smoke checks pass, API errors return to
   baseline, and affected captures reconcile with local orders.

## Authentication Or Registration Abuse

1. Compare failed sign-in volume, blocked auth records, registration-limit
   records, HTTP 429 responses, source networks, user agents, and geography.
2. Confirm that stored limiter keys are hashes. Do not expose raw identifiers in
   dashboards, tickets, or incident chat.
3. Apply WAF or bot controls to abusive patterns. Keep application rate limits
   enabled as defense in depth.
4. Do not delete limiter collections globally during an attack. Release a
   verified false-positive identity narrowly only when policy permits it.
5. Escalate to SEV-1 if account takeover is suspected; preserve authentication
   evidence and begin the security incident process.

## Latency Or Capacity Saturation

1. Identify whether pressure is at CDN, application, database, email, or payment
   providers. Compare endpoint latency and errors, not only aggregate averages.
2. Stop load generation immediately if failure rate exceeds 1%, checkout or
   payment errors increase, MongoDB enters its unsafe range, provider quotas are
   threatened, or monitoring loses visibility.
3. Prefer traffic shedding, cache restoration, and rollback over unbounded
   scaling of a saturated dependency.
4. During an approved capacity test, retain all artifacts required by
   `docs/LOAD_TESTING.md`. A test without complete generator, application,
   database, CDN, and provider evidence is not a capacity proof.
5. Recover only after p95 and p99 latency, error rate, saturation, and cache hit
   ratio remain inside the accepted baseline for at least 15 minutes.

## Rollback Safety

Before rollback, record the current and target SHAs and inspect migrations,
environment changes, payment changes, and order-schema compatibility. A code
rollback must not undo completed provider payments or overwrite order state.

After rollback:

1. Verify `/api/health` and `/api/ready`.
2. Run sign-in and registration smoke checks.
3. Run browse, cart, checkout, and order-detail smoke checks.
4. Verify Stripe webhook and PayPal test-mode flows when payment code changed.
5. Watch alerts for at least 15 minutes and record the result in the timeline.

## Evidence And Closure

An incident can close only when customer impact has ended, payment and order
states are reconciled, alert signals remain healthy through the observation
window, and temporary mitigations have an owner and expiry.

The incident record must contain:

- impact, severity, start, detection, mitigation, recovery, and end times
- release SHA and configuration changes
- redacted logs, metrics, provider event IDs, and dashboard snapshots
- every mitigation and its observed result
- reconciliation counts for affected payments and orders
- follow-up owners and due dates

Hold a blameless review for every SEV-1 and recurring SEV-2. Convert follow-up
work into focused issues and test the changed alert or runbook before closure.
