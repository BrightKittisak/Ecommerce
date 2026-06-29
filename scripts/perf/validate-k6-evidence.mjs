#!/usr/bin/env node

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { validateLoadTestEvidence } from './k6/load-evidence.mjs'

function readOption(args, name) {
  const index = args.indexOf(name)
  const value = index === -1 ? undefined : args[index + 1]

  if (!value || value.startsWith('--')) {
    throw new Error(`${name} is required`)
  }

  return value
}

function readPositiveInteger(args, name) {
  const value = Number(readOption(args, name))

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`)
  }

  return value
}

export function parseEvidenceOptions(args) {
  return {
    directory: readOption(args, '--dir'),
    runId: readOption(args, '--run-id'),
    baseUrl: readOption(args, '--base-url').replace(/\/$/, ''),
    targetVus: readPositiveInteger(args, '--target-vus'),
    generatorCount: readPositiveInteger(args, '--expected-generators'),
  }
}

export function readEvidenceDirectory(directory) {
  return readdirSync(directory)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => JSON.parse(readFileSync(join(directory, name), 'utf8')))
}

function main() {
  try {
    const expected = parseEvidenceOptions(process.argv.slice(2))
    const evidence = readEvidenceDirectory(expected.directory)
    const report = validateLoadTestEvidence(evidence, expected)

    console.log(
      `Load evidence: ${report.generatorCount} generators, ${report.combinedMaxVus} combined max VUs`
    )

    if (!report.passed) {
      console.error(`Load evidence failures: ${report.failures.join('; ')}`)
      process.exitCode = 1
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Evidence check failed')
    process.exitCode = 1
  }
}

if (process.argv[1]?.endsWith('validate-k6-evidence.mjs')) {
  main()
}
