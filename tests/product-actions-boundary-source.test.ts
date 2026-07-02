import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const productActionsSource = readFileSync('lib/actions/product.actions.ts', 'utf8')

function readSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name)
    const stats = statSync(path)

    if (stats.isDirectory()) return readSourceFiles(path)
    if (!/\.(ts|tsx)$/.test(name)) return []

    return [path]
  })
}

test('product read module is server-only instead of a Server Action bundle', () => {
  assert.equal(productActionsSource.includes("'use server'"), false)
  assert.equal(productActionsSource.includes("import 'server-only'"), true)
})

test('client components do not import server-only product read functions', () => {
  const clientFiles = [...readSourceFiles('app'), ...readSourceFiles('components')]
    .filter((path) => readFileSync(path, 'utf8').includes('use client'))

  for (const path of clientFiles) {
    const source = readFileSync(path, 'utf8')
    assert.equal(
      source.includes('@/lib/actions/product.actions') ||
        source.includes('lib/actions/product.actions'),
      false,
      path
    )
  }
})
