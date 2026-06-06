import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  ERROR_PAGE_MESSAGE,
  ERROR_PAGE_TITLE,
  getErrorPageMessage,
} from '../lib/error-page-copy'

test('uses safe generic copy on the app error page', () => {
  assert.equal(ERROR_PAGE_TITLE, 'เกิดข้อผิดพลาดบางอย่าง')
  assert.equal(getErrorPageMessage(), ERROR_PAGE_MESSAGE)
  assert.equal(ERROR_PAGE_MESSAGE.includes('MONGODB_URI'), false)
  assert.equal(ERROR_PAGE_MESSAGE.includes('debug_id'), false)
  assert.equal(ERROR_PAGE_MESSAGE.includes('secret'), false)
})

test('does not render raw error messages in the app error boundary', () => {
  const source = readFileSync('app/error.tsx', 'utf8')

  assert.equal(source.includes('{error.message}'), false)
  assert.equal(source.includes('getErrorPageMessage()'), true)
})
