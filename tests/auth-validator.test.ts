import assert from 'node:assert/strict'
import test from 'node:test'

import {
  UserSignInSchema,
  UserSignUpSchema,
} from '../lib/domain/user/auth.schema'

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
  const weakPasswordCases = [
    ['short1!', 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'],
    [
      'lowercase1!',
      'รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษพิมพ์ใหญ่อย่างน้อย 1 ตัว',
    ],
    [
      'UPPERCASE1!',
      'รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษพิมพ์เล็กอย่างน้อย 1 ตัว',
    ],
    ['NoNumber!', 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว'],
    ['NoSpecial1', 'รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว'],
  ]

  for (const [password, message] of weakPasswordCases) {
    const result = UserSignUpSchema.safeParse({
        ...validSignUpInput,
        password,
        confirmPassword: password,
      })

    assert.equal(result.success, false)
    if (!result.success) {
      assert.equal(result.error.issues[0]?.message, message)
    }
  }
})

test('rejects sign-up when password confirmation does not match', () => {
  assert.throws(
    () =>
      UserSignUpSchema.parse({
        ...validSignUpInput,
        confirmPassword: 'Different1!',
      }),
    /รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน/
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
