import assert from 'node:assert/strict'
import test from 'node:test'

import { normalizePaginationPage } from '../lib/pagination'

test('normalizes invalid pagination pages to the first page', () => {
  assert.equal(normalizePaginationPage(undefined), 1)
  assert.equal(normalizePaginationPage('not-a-page'), 1)
  assert.equal(normalizePaginationPage(1.5), 1)
  assert.equal(normalizePaginationPage(-10), 1)
  assert.equal(normalizePaginationPage(0), 1)
})

test('accepts integer pagination pages and caps excessive values', () => {
  assert.equal(normalizePaginationPage('3'), 3)
  assert.equal(normalizePaginationPage(4), 4)
  assert.equal(normalizePaginationPage('999999'), 1000)
  assert.equal(normalizePaginationPage('42', { maxPage: 10 }), 10)
})
