import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync('app/(root)/product/[slug]/review-list.tsx', 'utf8')

test('review list does not suppress lint rules for async review loading', () => {
  assert.equal(source.includes('eslint-disable'), false)
  assert.equal(source.includes('catch (err)'), false)
  assert.equal(source.includes('}, [inView, product._id])'), true)
})
