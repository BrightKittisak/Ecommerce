import assert from 'node:assert/strict'
import test from 'node:test'

import {
  readRequestTextWithLimit,
  RequestBodyTooLargeError,
} from '../lib/request-body'

const createRequest = (body: string, headers?: HeadersInit) =>
  new Request('https://example.test/webhook', {
    method: 'POST',
    body,
    headers,
  })

test('reads request text up to an exact byte limit', async () => {
  const body = 'สวัสดี'
  const byteLength = new TextEncoder().encode(body).byteLength

  assert.equal(
    await readRequestTextWithLimit(createRequest(body), byteLength),
    body
  )
})

test('rejects streamed request bodies that exceed the byte limit', async () => {
  const body = 'สวัสดี'
  const byteLength = new TextEncoder().encode(body).byteLength

  await assert.rejects(
    () => readRequestTextWithLimit(createRequest(body), byteLength - 1),
    RequestBodyTooLargeError
  )
})

test('rejects oversized content lengths before reading the body', async () => {
  const request = createRequest('small', { 'content-length': '1048577' })

  await assert.rejects(
    () => readRequestTextWithLimit(request, 1024 * 1024),
    RequestBodyTooLargeError
  )

  assert.equal(request.bodyUsed, false)
})

test('rejects invalid body limits', async () => {
  await assert.rejects(
    () => readRequestTextWithLimit(createRequest('body'), 0),
    RangeError
  )
})
