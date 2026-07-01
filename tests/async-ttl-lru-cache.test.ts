import assert from 'node:assert/strict'
import test from 'node:test'

import { createAsyncTtlLruCache } from '../lib/async-ttl-lru-cache'

test('coalesces concurrent loads and reuses values within the TTL', async () => {
  let loads = 0
  const cache = createAsyncTtlLruCache<string, string>({
    maxEntries: 2,
    ttlMs: 100,
    now: () => 0,
  })
  const load = async () => {
    loads += 1
    return 'value'
  }

  const [first, second] = await Promise.all([
    cache.getOrCreate('key', load),
    cache.getOrCreate('key', load),
  ])
  const third = await cache.getOrCreate('key', load)

  assert.deepEqual([first, second, third], ['value', 'value', 'value'])
  assert.equal(loads, 1)
})

test('expires old values and removes failed loads', async () => {
  let currentTime = 0
  let loads = 0
  const cache = createAsyncTtlLruCache<string, number>({
    maxEntries: 2,
    ttlMs: 10,
    now: () => currentTime,
  })

  await assert.rejects(
    cache.getOrCreate('failure', async () => {
      throw new Error('load failed')
    }),
    /load failed/
  )
  assert.equal(cache.size, 0)

  const load = async () => ++loads
  assert.equal(await cache.getOrCreate('key', load), 1)
  currentTime = 10
  assert.equal(await cache.getOrCreate('key', load), 2)
})

test('evicts the least recently used entry at the size bound', async () => {
  let loads = 0
  const cache = createAsyncTtlLruCache<string, string>({
    maxEntries: 2,
    ttlMs: 100,
    now: () => 0,
  })
  const load = async (key: string) => {
    loads += 1
    return key
  }

  await cache.getOrCreate('first', () => load('first'))
  await cache.getOrCreate('second', () => load('second'))
  await cache.getOrCreate('first', () => load('first'))
  await cache.getOrCreate('third', () => load('third'))
  await cache.getOrCreate('second', () => load('second'))

  assert.equal(cache.size, 2)
  assert.equal(loads, 4)
})

test('rejects unsafe cache bounds', () => {
  assert.throws(
    () => createAsyncTtlLruCache({ maxEntries: 0, ttlMs: 100 }),
    /maxEntries/
  )
  assert.throws(
    () => createAsyncTtlLruCache({ maxEntries: 1, ttlMs: 0 }),
    /ttlMs/
  )
})
