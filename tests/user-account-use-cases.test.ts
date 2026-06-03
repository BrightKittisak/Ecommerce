import assert from 'node:assert/strict'
import test from 'node:test'

import { registerUserAccount } from '../lib/application/users/register-user-account'
import { updateUserNameForAccount } from '../lib/application/users/update-user-name'

test('registers users with normalized emails and hashed passwords', async () => {
  let createdUser:
    | {
        name: string
        email: string
        password: string
      }
    | undefined

  await registerUserAccount({
    userSignUp: {
      name: 'Kitti',
      email: '  KITTI@EXAMPLE.COM ',
      password: 'StrongPass1!',
      confirmPassword: 'StrongPass1!',
    },
    deps: {
      createUserAccount: async (user) => {
        createdUser = user
      },
      hashPassword: async (password) => `hashed:${password}`,
    },
  })

  assert.deepEqual(createdUser, {
    name: 'Kitti',
    email: 'kitti@example.com',
    password: 'hashed:StrongPass1!',
  })
})

test('updates user names through the account repository dependency', async () => {
  let saved = false
  const userRecord = {
    name: 'Old Name',
    save: async () => {
      saved = true
      return { name: userRecord.name }
    },
  }

  const result = await updateUserNameForAccount({
    userId: 'user-1',
    user: { name: 'New Name' },
    deps: {
      findUserById: async () => userRecord,
    },
  })

  assert.equal(saved, true)
  assert.deepEqual(result, {
    name: 'New Name',
  })
})

test('rejects user name updates when the account cannot be found', async () => {
  await assert.rejects(
    updateUserNameForAccount({
      userId: 'missing-user',
      user: { name: 'New Name' },
      deps: {
        findUserById: async () => null,
      },
    }),
    /ไม่พบบัญชีผู้ใช้/
  )
})
