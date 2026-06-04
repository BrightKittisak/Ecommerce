import assert from 'node:assert/strict'
import test from 'node:test'

import {
  serializeTypedForClient,
  type Serialized,
} from '../lib/serialization'

test('serializes values into client-safe plain JSON data', () => {
  const serialized = serializeTypedForClient({
    id: {
      toJSON: () => '507f1f77bcf86cd799439011',
    },
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    nested: {
      value: 1,
    },
  })

  assert.deepEqual(serialized, {
    id: '507f1f77bcf86cd799439011',
    createdAt: '2026-06-01T00:00:00.000Z',
    nested: {
      value: 1,
    },
  })
})

test('omits undefined object fields and converts undefined array items to null', () => {
  const serialized = serializeTypedForClient({
    name: 'Client Payload',
    omitted: undefined,
    values: [1, undefined, new Date('2026-06-01T00:00:00.000Z')],
  })

  assert.deepEqual(serialized, {
    name: 'Client Payload',
    values: [1, null, '2026-06-01T00:00:00.000Z'],
  })
})

test('rejects unsupported client serialization values', () => {
  assert.throws(
    () =>
      serializeTypedForClient({
        amount: BigInt(1),
      }),
    /Cannot serialize unsupported value/
  )
})

test('typed serializer exposes the serialized output shape', () => {
  type ServerValue = {
    _id: { toJSON: () => string }
    createdAt: Date
    items: Array<{
      deliveredAt: Date | null
    }>
  }

  const serialized: Serialized<ServerValue> = serializeTypedForClient({
    _id: {
      toJSON: () => '507f1f77bcf86cd799439011',
    },
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    items: [
      {
        deliveredAt: new Date('2026-06-02T00:00:00.000Z'),
      },
      {
        deliveredAt: null,
      },
    ],
  })

  assert.deepEqual(serialized, {
    _id: '507f1f77bcf86cd799439011',
    createdAt: '2026-06-01T00:00:00.000Z',
    items: [
      {
        deliveredAt: '2026-06-02T00:00:00.000Z',
      },
      {
        deliveredAt: null,
      },
    ],
  })
})
