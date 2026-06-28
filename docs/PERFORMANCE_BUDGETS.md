# Performance Budgets

The production build has a gzip-based client bundle gate. It reads the Next.js
build manifests and fails when shared assets or high-traffic routes exceed their
budget.

## Run Locally

```bash
npm run build
npm run build:budget
```

The CI release gates run the same commands for every pull request into
`develop` or `main`.

## Current Budgets

| Bundle | Budget |
| --- | ---: |
| Shared client assets | 120 KiB |
| Product detail | 240 KiB |
| Checkout | 220 KiB |
| Home | 200 KiB |
| Search | 185 KiB |

The initial measured gzip baselines were approximately 100 KiB shared, 214 KiB
for product detail, 191 KiB for checkout, 173 KiB for home, and 162 KiB for
search. The budgets leave limited headroom while still catching meaningful
regressions.

Do not raise a budget only to make CI pass. First inspect the bundle analyzer,
remove unnecessary client boundaries or dependencies, and lazy-load optional
features. If a deliberate product change still requires a larger bundle,
document the measured impact and reason in the pull request.
