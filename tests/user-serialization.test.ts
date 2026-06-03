import assert from 'node:assert/strict'
import test from 'node:test'

import { toUpdatedUserNameDTO } from '../lib/application/users/serializers'

test('serializes updated user names without leaking document fields', () => {
  const userDocument = {
    name: 'Kitti',
    email: 'kitti@example.com',
    password: 'hashed-password',
  }

  const serialized = toUpdatedUserNameDTO(userDocument)

  assert.deepEqual(serialized, {
    name: 'Kitti',
  })
})
