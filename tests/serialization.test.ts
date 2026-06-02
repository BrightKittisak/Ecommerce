import assert from 'node:assert/strict'
import test from 'node:test'

import {
  serializeForClient,
  serializeTypedForClient,
  type Serialized,
} from '../lib/serialization'

test('serializes values into client-safe plain JSON data', () => {
  const serialized = serializeForClient({
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
