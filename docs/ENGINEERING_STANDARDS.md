# Engineering Standards

This document defines the target engineering standards for the next stage of the
project.

## Priorities

The project is being pushed toward:

- production readiness
- stronger security
- better performance
- better scale characteristics
- cleaner code

When tradeoffs appear, prefer:

1. correctness
2. security
3. operational safety
4. maintainability
5. convenience

## Clean Code Means More Than Formatting

For this project, "clean code" means:

- clear architectural boundaries
- predictable dependency direction
- small, focused modules
- business logic outside route and page components
- explicit ownership of data transformations
- no hidden trust in client input
- no ad hoc serialization patterns as a default escape hatch

Formatting matters, but it is not enough by itself.

## Target Architecture Boundaries

The target direction is:

- `app/`
  - routing, page composition, metadata, request boundary code
- `components/`
  - presentation and interaction components only
- `lib/domain/`
  - domain models, invariants, state transitions
- `lib/application/`
  - use cases, orchestration, commands, queries
- `lib/infrastructure/`
  - database adapters, payment adapters, email adapters, cache adapters,
    logging, search adapters
- `lib/shared/`
  - cross-cutting utilities that do not encode business rules

The current repository does not fully follow this split yet. New work should
move the codebase closer to it instead of farther away.

## Code Rules

- Avoid `any`. Use explicit types or `unknown` with narrowing.
- Avoid `JSON.parse(JSON.stringify(...))` as a generic model-mapping strategy.
  Prefer explicit serializers or `lean()` queries with mapped output types.
- Keep server-authoritative logic on the server.
- Keep page files thin. They should compose, not own business rules.
- Keep route handlers thin. They should validate input, call a use case, and
  return a response.
- Keep React client components focused on UI state and interaction.
- Put payment, order, pricing, and inventory rules in application or domain
  modules, not UI components.

## Security Rules

- Never trust pricing, stock, role, or payment status from the client.
- Payment completion must be confirmed by provider-verified server workflows.
- Auth defaults must be secure by default.
- Sensitive flows must be idempotent.
- Security-relevant actions should be observable and auditable.

## Performance Rules

- Public browse traffic should be cache-first whenever possible.
- Avoid repeated database calls in shared layout paths.
- Prefer precomputed or cached navigation data for global UI.
- Search and large catalog filtering should not rely on broad regex queries for
  high-traffic production use.

## Refactor Rules

- Refactors should improve boundaries, not just rename files.
- Large refactors must be split into reviewable vertical slices.
- Behavior changes and structural cleanup should be separated when possible.
- New code should follow the target shape even if surrounding legacy code does
  not yet.

## Quality Gates

At minimum, changed areas should be able to pass:

- lint
- typecheck
- targeted tests
- production build

For sensitive areas such as auth, payments, and orders, add:

- regression coverage
- failure-path validation
- rollback notes

## Preferred Direction for This Codebase

The highest-value cleanup areas are:

- auth and authorization boundaries
- order creation and pricing ownership
- payment verification and webhook handling
- product search and listing query paths
- shared layout and header data fetching
- serializer and DTO boundaries
