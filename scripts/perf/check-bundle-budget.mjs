#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

export const DEFAULT_MANIFEST_PATH = '.next/app-build-manifest.json'
export const DEFAULT_BUILD_MANIFEST_PATH = '.next/build-manifest.json'

export const DEFAULT_BUDGETS = {
  shared: 120 * 1024,
  routes: {
    '/(root)/product/[slug]/page': 240 * 1024,
    '/checkout/page': 220 * 1024,
    '/(home)/page': 200 * 1024,
    '/(root)/search/page': 185 * 1024,
  },
}

const CLIENT_ASSET_PATTERN = /\.(js|css)$/

/**
 * @typedef {object} BundleBudgets
 * @property {number} shared
 * @property {Record<string, number>} routes
 */

/**
 * @typedef {object} AppBuildManifest
 * @property {Record<string, string[]>} [pages]
 */

function formatKiB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function getGzipSize(buildDir, file) {
  return gzipSync(readFileSync(join(buildDir, file))).length
}

/**
 * @param {string[]} files
 * @param {(file: string) => number} getAssetSize
 */
export function sumClientAssetSize(files, getAssetSize) {
  return files
    .filter((file) => CLIENT_ASSET_PATTERN.test(file))
    .reduce((sum, file) => sum + getAssetSize(file), 0)
}

/**
 * @param {object} input
 * @param {string} [input.buildDir]
 * @param {AppBuildManifest} input.manifest
 * @param {string[]} [input.sharedFiles]
 * @param {BundleBudgets} [input.budgets]
 * @param {(file: string) => number} [input.getAssetSize]
 */
export function calculateBundleBudgetReport({
  buildDir = '.next',
  manifest,
  sharedFiles = [],
  budgets = DEFAULT_BUDGETS,
  getAssetSize = (file) => getGzipSize(buildDir, file),
}) {
  const measurements = []
  const failures = []
  const sharedBytes = sumClientAssetSize(sharedFiles, getAssetSize)

  measurements.push({
    name: 'shared',
    bytes: sharedBytes,
    budget: budgets.shared,
  })

  for (const [route, budget] of Object.entries(budgets.routes)) {
    const files = manifest.pages?.[route]

    if (!files) {
      failures.push(`${route} is missing from ${DEFAULT_MANIFEST_PATH}`)
      continue
    }

    measurements.push({
      name: route,
      bytes: sumClientAssetSize(files, getAssetSize),
      budget,
    })
  }

  for (const measurement of measurements) {
    if (measurement.bytes > measurement.budget) {
      failures.push(
        `${measurement.name} ${formatKiB(measurement.bytes)} exceeded ${formatKiB(
          measurement.budget
        )}`
      )
    }
  }

  return { measurements, failures }
}

function printReport(report) {
  for (const measurement of report.measurements) {
    console.log(
      `${measurement.name}: ${formatKiB(measurement.bytes)} / ${formatKiB(
        measurement.budget
      )}`
    )
  }
}

function main() {
  if (
    !existsSync(DEFAULT_MANIFEST_PATH) ||
    !existsSync(DEFAULT_BUILD_MANIFEST_PATH)
  ) {
    console.error(
      `Next.js build manifests were not found. Run npm run build before npm run build:budget.`
    )
    process.exitCode = 1
    return
  }

  const manifest = readJson(DEFAULT_MANIFEST_PATH)
  const buildManifest = readJson(DEFAULT_BUILD_MANIFEST_PATH)
  const report = calculateBundleBudgetReport({
    manifest,
    sharedFiles: buildManifest.rootMainFiles ?? [],
  })

  printReport(report)

  if (report.failures.length > 0) {
    console.error(`Bundle budget failures: ${report.failures.join('; ')}`)
    process.exitCode = 1
  }
}

if (process.argv[1]?.endsWith('check-bundle-budget.mjs')) {
  main()
}
