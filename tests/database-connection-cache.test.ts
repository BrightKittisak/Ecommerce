import assert from 'node:assert/strict'
import test from 'node:test'

import {
  resolveCachedConnection,
  type ConnectionCache,
} from '../lib/db/connection-cache'

test('reuses an established database connection', async () => {
  const establishedConnection = { id: 'connected' }
  const cache: ConnectionCache<typeof establishedConnection> = {
    conn: establishedConnection,
    promise: null,
  }
  let connectCalls = 0

  const connection = await resolveCachedConnection(cache, async () => {
    connectCalls += 1
    return { id: 'new' }
  })

  assert.equal(connection, establishedConnection)
  assert.equal(connectCalls, 0)
})

test('deduplicates concurrent database connection attempts', async () => {
  const connection = { id: 'shared' }
  const cache: ConnectionCache<typeof connection> = {
    conn: null,
    promise: null,
  }
  let connectCalls = 0
  let resolveConnection: ((value: typeof connection) => void) | undefined

  const connect = () => {
    connectCalls += 1
    return new Promise<typeof connection>((resolve) => {
      resolveConnection = resolve
    })
  }

  const first = resolveCachedConnection(cache, connect)
  const second = resolveCachedConnection(cache, connect)

  assert.equal(connectCalls, 1)
  resolveConnection?.(connection)

  assert.equal(await first, connection)
  assert.equal(await second, connection)
  assert.equal(cache.conn, connection)
})

test('clears a rejected connection promise so a warm process can retry', async () => {
  const connection = { id: 'recovered' }
  const cache: ConnectionCache<typeof connection> = {
    conn: null,
    promise: null,
  }
  let connectCalls = 0

  const connect = async () => {
    connectCalls += 1
    if (connectCalls === 1) throw new Error('temporary database outage')
    return connection
  }

  await assert.rejects(
    resolveCachedConnection(cache, connect),
    /temporary database outage/
  )
  assert.equal(cache.promise, null)

  assert.equal(await resolveCachedConnection(cache, connect), connection)
  assert.equal(connectCalls, 2)
})
