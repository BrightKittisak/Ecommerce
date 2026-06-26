import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import test from 'node:test'

const SOURCE_DIRS = ['app', 'components', 'emails', 'lib', 'types', 'tests']
const TEXT_FILE_PATTERN = /\.(ts|tsx|md)$/
const MOJIBAKE_PATTERN = new RegExp(
  '[\\uFFFD]|\\u00E0[\\u00B8\\u00B9]|\\u00C3|\\u0E40\\u0E19[\\u0080-\\u00FF]',
)

function collectTextFiles(path: string, files: string[] = []) {
  if (!existsSync(path)) {
    return files
  }

  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const entryPath = `${path}/${entry.name}`

    if (entry.isDirectory()) {
      collectTextFiles(entryPath, files)
      continue
    }

    if (TEXT_FILE_PATTERN.test(entry.name)) {
      files.push(entryPath)
    }
  }

  return files
}

test('does not contain mojibake markers in source text files', () => {
  const files = SOURCE_DIRS.flatMap((path) => collectTextFiles(path))
  const badFiles = files.filter((file) =>
    MOJIBAKE_PATTERN.test(readFileSync(file, 'utf8')),
  )

  assert.deepEqual(badFiles, [])
})

test('keeps static help-page shopping copy fully localized', () => {
  const source = readFileSync('app/page/[slug]/page.tsx', 'utf8')

  assert.equal(source.includes('flow การซื้อ'), false)
  assert.equal(source.includes('ขั้นตอนการซื้อ'), true)
})
