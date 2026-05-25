# Phase 1 Execution Plan

This document turns the high-level roadmap into the first executable delivery
plan for the repository.

Phase 1 is the first real implementation phase after baseline workflow and
documentation work.
Its job is to reduce the highest production risks before the team spends time on
scale optimization or broader cleanup.

## Phase 1 Goal

Phase 1 hardens the transactional core:

- auth defaults become safer
- orders become server-authoritative
- payment verification becomes stricter
- tests begin covering the riskiest flows

This phase is intentionally not trying to solve every architecture problem at
once.
It is focused on lowering the biggest production risks first.

## Scope

In scope:

- auth hardening
- order trust-boundary refactor
- payment verification hardening
- initial high-risk regression coverage

Out of scope:

- search engine migration
- full catalog caching architecture
- large UI redesign
- observability platform rollout
- complete domain-layer reorganization

## Delivery Rules

- All branches start from `develop`.
- One branch should represent one concern.
- One PR should represent one concern.
- Avoid mixing behavior changes with broad cleanup unless the change is too
  tightly coupled to separate safely.
- For risky PRs, include rollback notes and affected flows.

## Workstreams

## Workstream A: Auth Hardening

### Branch 1

- Branch: `fix/auth-password-policy`
- Goal: raise credential safety baseline
- Expected changes:
  - strengthen password validation rules
  - raise password hash cost
  - make auth-related validation clearer and more consistent
- Validation:
  - sign-up still works
  - credential sign-in still works
  - weak passwords are rejected

### Branch 2

- Branch: `fix/auth-account-linking-policy`
- Goal: remove risky account-linking defaults
- Expected changes:
  - review and tighten Google account linking behavior
  - confirm the intended behavior for existing users and new users
- Validation:
  - Google sign-in works for intended cases
  - unauthorized account-linking paths are not silently permitted

### Branch 3

- Branch: `feat/auth-rate-limit-foundation`
- Goal: prepare the auth entry points for abuse resistance
- Expected changes:
  - add a rate-limit abstraction or placeholder integration path
  - identify which routes and actions need protection first
- Validation:
  - sign-in path still works normally
  - rate-limit behavior is testable or mockable

## Workstream B: Order Trust Boundary

### Branch 4

- Branch: `refactor/order-server-authoritative-contract`
- Goal: stop trusting client order payloads as the system of record
- Expected changes:
  - define the server-side order input contract
  - narrow client payloads to identifiers and requested quantities or variants
- Validation:
  - order creation still succeeds for valid flows
  - payloads with manipulated price or stock data are ignored or rejected

### Branch 5

- Branch: `refactor/order-pricing-from-db`
- Goal: compute trusted pricing, stock, and totals on the server
- Expected changes:
  - fetch product data from the database during order creation
  - derive price, totals, and stock checks from server data only
- Validation:
  - totals are consistent with database pricing
  - tampered client totals no longer affect persisted orders

### Branch 6

- Branch: `fix/order-stock-validation`
- Goal: enforce stock checks server-side before order creation
- Expected changes:
  - validate availability at order time
  - prepare the codebase for later stock reservation work
- Validation:
  - valid orders pass
  - out-of-stock requests fail safely

## Workstream C: Payment Verification

### Branch 7

- Branch: `fix/stripe-webhook-verification`
- Goal: tighten Stripe payment confirmation logic
- Expected changes:
  - verify amount, currency, order id, and event handling path
  - improve idempotent processing behavior
- Validation:
  - duplicate webhook events do not double-process
  - mismatched payment data does not mark orders paid

### Branch 8

- Branch: `fix/stripe-success-page-trust-boundary`
- Goal: keep the success page informational, not authoritative
- Expected changes:
  - reduce reliance on return-page status as the source of truth
  - make paid-state ownership clearly belong to verified server workflows
- Validation:
  - success page still renders for valid payments
  - direct success-page access cannot finalize an order

### Branch 9

- Branch: `fix/paypal-capture-verification`
- Goal: tighten PayPal capture verification
- Expected changes:
  - verify capture amount and currency
  - confirm order linkage and idempotent behavior
- Validation:
  - only valid captured payments can mark orders paid
  - mismatched capture data is rejected

## Workstream D: Regression Coverage

### Branch 10

- Branch: `test/order-server-authoritative`
- Goal: add coverage for server-side order ownership rules
- Expected changes:
  - tests around pricing, stock, and malformed payload handling
- Validation:
  - tests fail on trust-boundary regressions

### Branch 11

- Branch: `test/payment-verification-regressions`
- Goal: add coverage for payment verification paths
- Expected changes:
  - tests for Stripe and PayPal validation rules
  - tests for idempotent payment processing behavior
- Validation:
  - repeated events and mismatched amounts are covered

## Suggested Sequence

Recommended order:

1. `fix/auth-password-policy`
2. `fix/auth-account-linking-policy`
3. `refactor/order-server-authoritative-contract`
4. `refactor/order-pricing-from-db`
5. `fix/order-stock-validation`
6. `fix/stripe-webhook-verification`
7. `fix/stripe-success-page-trust-boundary`
8. `fix/paypal-capture-verification`
9. `test/order-server-authoritative`
10. `test/payment-verification-regressions`
11. `feat/auth-rate-limit-foundation`

Parallelism that should be safe:

- auth hardening can run in parallel with order trust-boundary work
- payment verification can start after order trust-boundary contracts are clear
- test branches can start once the corresponding implementation branches settle

## PR Sizing Guidance

Good PR size examples:

- one validation policy change
- one payment verification fix
- one order-contract refactor
- one focused test suite

Bad PR size examples:

- all auth changes together
- all payment providers plus tests plus logging in one PR
- large file moves mixed with behavior changes and UI cleanup

## Acceptance Criteria for Phase 1

Phase 1 is complete when:

- client payloads no longer control trusted price or stock data
- Stripe and PayPal payment completion logic verifies trusted payment facts
- auth defaults are safer than the current baseline
- the riskiest order and payment paths have regression coverage
- `lint`, `typecheck`, targeted tests, and `build` are part of the branch
  validation routine

## Ready-to-Start Branches

If the team wants to begin immediately, start with:

1. `fix/auth-password-policy`
2. `refactor/order-server-authoritative-contract`
3. `fix/stripe-webhook-verification`

These three branches lower risk quickly and create momentum for the rest of the
program.
