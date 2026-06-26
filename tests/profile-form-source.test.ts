import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(
  'app/(root)/account/manage/name/profile-form.tsx',
  'utf8',
)

test('profile form uses a type-safe empty-name fallback', () => {
  assert.equal(source.includes('session?.user?.name!'), false)
  assert.equal(source.includes('no-non-null-asserted-optional-chain'), false)
  assert.equal(source.includes("name: session?.user?.name ?? ''"), true)
})
