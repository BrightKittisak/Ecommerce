import assert from 'node:assert/strict'
import test from 'node:test'

type BundleBudgetScript = typeof import('../scripts/perf/check-bundle-budget.mjs')

let calculateBundleBudgetReport: BundleBudgetScript['calculateBundleBudgetReport']
let sumClientAssetSize: BundleBudgetScript['sumClientAssetSize']

test.before(async () => {
  const script = await import('../scripts/perf/check-bundle-budget.mjs')

  calculateBundleBudgetReport = script.calculateBundleBudgetReport
  sumClientAssetSize = script.sumClientAssetSize
})

test('sums only client JavaScript and CSS assets', () => {
  const sizes = new Map([
    ['shared.js', 30],
    ['styles.css', 20],
    ['metadata.json', 100],
  ])

  assert.equal(
    sumClientAssetSize(
      ['shared.js', 'styles.css', 'metadata.json'],
      (file) => sizes.get(file) ?? 0
    ),
    50
  )
})

test('reports passing shared and route bundle measurements', () => {
  const report = calculateBundleBudgetReport({
    manifest: { pages: { '/store/page': ['shared.js', 'store.js'] } },
    sharedFiles: ['shared.js'],
    budgets: { shared: 100, routes: { '/store/page': 200 } },
    getAssetSize: (file) => ({ 'shared.js': 50, 'store.js': 75 })[file] ?? 0,
  })

  assert.deepEqual(report, {
    measurements: [
      { name: 'shared', bytes: 50, budget: 100 },
      { name: '/store/page', bytes: 125, budget: 200 },
    ],
    failures: [],
  })
})

test('reports over-budget bundles and missing routes', () => {
  const report = calculateBundleBudgetReport({
    manifest: { pages: { '/store/page': ['store.js'] } },
    sharedFiles: ['shared.js'],
    budgets: {
      shared: 100,
      routes: { '/store/page': 100, '/missing/page': 100 },
    },
    getAssetSize: () => 125,
  })

  assert.deepEqual(report.failures, [
    '/missing/page is missing from .next/app-build-manifest.json',
    'shared 0.1 KiB exceeded 0.1 KiB',
    '/store/page 0.1 KiB exceeded 0.1 KiB',
  ])
})
