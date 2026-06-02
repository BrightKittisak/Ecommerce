import assert from 'node:assert/strict'
import test from 'node:test'

import { UserSignInSchema, UserSignUpSchema } from '../lib/auth-validator'

const validSignUpInput = {
  name: 'Buyer Example',
  email: 'buyer@example.com',
  password: 'Str0ng!Password',
  confirmPassword: 'Str0ng!Password',
}

test('accepts strong credential passwords during sign-up', () => {
  const parsedInput = UserSignUpSchema.parse(validSignUpInput)

  assert.deepEqual(parsedInput, validSignUpInput)
})

test('normalizes credential emails during sign-up and sign-in', () => {
  assert.equal(
    UserSignUpSchema.parse({
      ...validSignUpInput,
      email: '  Buyer@Example.COM ',
    }).email,
    'buyer@example.com'
  )

  assert.equal(
    UserSignInSchema.parse({
      email: '  Buyer@Example.COM ',
      password: 'legacy',
    }).email,
    'buyer@example.com'
  )
})

test('rejects weak credential passwords during sign-up', () => {
  const weakPasswords = [
    'short1!',
    'lowercase1!',
    'UPPERCASE1!',
    'NoNumber!',
    'NoSpecial1',
  ]

  for (const password of weakPasswords) {
    assert.throws(() =>
      UserSignUpSchema.parse({
        ...validSignUpInput,
        password,
        confirmPassword: password,
      })
    )
  }
})

test('rejects sign-up when password confirmation does not match', () => {
  assert.throws(
    () =>
      UserSignUpSchema.parse({
        ...validSignUpInput,
        confirmPassword: 'Different1!',
      }),
    /Passwords do not match/
  )
})

test('keeps sign-in compatible with existing credential passwords', () => {
  const parsedInput = UserSignInSchema.parse({
    email: 'buyer@example.com',
    password: 'legacy',
  })

  assert.deepEqual(parsedInput, {
    email: 'buyer@example.com',
    password: 'legacy',
  })
})

test('rejects invalid sign-in emails and empty passwords', () => {
  assert.throws(() =>
    UserSignInSchema.parse({
      email: 'not-an-email',
      password: 'legacy',
    })
  )

  assert.throws(() =>
    UserSignInSchema.parse({
      email: 'buyer@example.com',
      password: '',
    })
  )
})
