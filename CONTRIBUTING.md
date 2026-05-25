# Contributing

This project is currently in a high-risk refactor and hardening program.
The goals are:

- production-grade reliability
- stronger security
- faster page delivery
- cleaner code boundaries
- support for large-scale traffic over time

Use this document as the source of truth for Git workflow, branch naming,
PR expectations, and merge rules.

## Branch Model

- `main`
  - production-ready branch
  - must stay releasable
  - accepts only hotfixes, security fixes, and critical regressions while the
    refactor program is active
- `develop`
  - temporary integration branch for the refactor, scale, security, and cleanup
    program
  - all normal work branches start from `develop`

After the refactor program is complete, the long-term goal is to reduce
dependency on `develop` and move back toward a simpler trunk model.

## Branch Naming

Use one of these prefixes:

- `feat/**`
- `fix/**`
- `refactor/**`
- `chore/**`
- `docs/**`
- `test/**`
- `perf/**`
- `hotfix/**`

Examples:

- `feat/search-index-adapter`
- `fix/stripe-webhook-verification`
- `refactor/order-domain-split`
- `perf/header-cache`
- `test/order-server-authoritative`
- `hotfix/payment-webhook-timeout`

## Working Rules

- Start normal work from `develop`.
- Keep branches short-lived.
- Keep one branch focused on one concern.
- Keep one PR focused on one concern.
- Do not mix architecture refactors, behavior changes, and unrelated cleanup in
  the same PR unless the work is inseparable.
- Sync urgent `main` hotfixes back into `develop` quickly.

## Commit Convention

Use:

`type(scope): summary`

Examples:

- `feat(search): add catalog index adapter`
- `fix(auth): tighten admin authorization`
- `refactor(order): move pricing to server`
- `perf(home): cache featured product queries`
- `docs(workflow): define branch and PR policy`

Recommended types:

- `feat`
- `fix`
- `refactor`
- `perf`
- `test`
- `docs`
- `chore`
- `hotfix`

## Pull Request Rules

Every PR should include:

- a short summary of the change
- the reason for the change
- the risk level
- validation notes
- rollback notes for risky changes

Every PR should be reviewable:

- prefer small to medium PRs
- split broad work into separate slices
- isolate schema changes, payment changes, auth changes, and infrastructure
  changes when possible

## Merge Strategy

- branch to `develop`: `squash merge`
- `develop` to `main`: controlled merge after release validation
- `main` hotfixes: merge or cherry-pick back into `develop` immediately after
  release

## Release Gates

Before merging risky work into `develop`, the branch should be green on:

- `npm run lint`
- `npx tsc --noEmit`
- automated tests for the affected area
- `npm run build`

Before promoting `develop` to `main`, also require:

- key user flows verified
- security-sensitive changes reviewed
- migration and rollback notes prepared
- performance and operational impact understood

## Feature Freeze Policy

While the major refactor program is active:

- `main` is feature-frozen
- only hotfixes, security fixes, and critical production regressions go to
  `main`
- normal product work should either wait or be planned as part of the refactor
  roadmap on `develop`

## Definition of Done

Work is not done when code only "works on my machine".
It is done when:

- the scope is clear
- the branch is focused
- the code follows project standards
- validation is documented
- review concerns are addressed
- the merge path is safe
