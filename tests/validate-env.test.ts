import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

type ValidateEnvModule = typeof import('../scripts/validate-env.mjs')

let validateProductionEnv: ValidateEnvModule['validateProductionEnv']
let parseDotEnv: ValidateEnvModule['parseDotEnv']

const validEnv = {
  AUTH_GOOGLE_ID: 'google-client-id',
  AUTH_GOOGLE_SECRET: 'google-client-secret',
  AUTH_SECRET: 'a-secure-auth-secret-with-32-characters',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/ecommerce',
  NEXT_PUBLIC_SERVER_URL: 'https://shop.example.com',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_example',
  PAYPAL_API_URL: 'https://api-m.sandbox.paypal.com',
  PAYPAL_APP_SECRET: 'paypal-app-secret',
  PAYPAL_CLIENT_ID: 'paypal-client-id',
  RESEND_API_KEY: 're_example',
  SENDER_EMAIL: 'orders@example.com',
  STRIPE_SECRET_KEY: 'sk_test_example',
  STRIPE_WEBHOOK_SECRET: 'whsec_example',
  PAGE_SIZE: '9',
  FREE_SHIPPING_MIN_PRICE: '1190',
}

test.before(async () => {
  const validateEnvModule = await import('../scripts/validate-env.mjs')
  validateProductionEnv = validateEnvModule.validateProductionEnv
  parseDotEnv = validateEnvModule.parseDotEnv
})

test('accepts a complete production environment contract', () => {
  assert.deepEqual(validateProductionEnv(validEnv), [])
})

test('keeps the committed environment example aligned with validation', () => {
  const exampleEnv = parseDotEnv(readFileSync('.env.example', 'utf8'))

  assert.deepEqual(validateProductionEnv(exampleEnv), [])
})

test('parses dotenv values without truncating equals signs or quoted secrets', () => {
  assert.deepEqual(
    parseDotEnv(`
# comment
AUTH_SECRET="secret=with=equals"
export PAYPAL_CLIENT_ID='client-id'
INVALID LINE
`),
    {
      AUTH_SECRET: 'secret=with=equals',
      PAYPAL_CLIENT_ID: 'client-id',
    }
  )
})

test('reports missing required environment variable names', () => {
  const errors = validateProductionEnv({})

  assert.equal(errors.includes('MONGODB_URI is required'), true)
  assert.equal(errors.includes('AUTH_SECRET is required'), true)
  assert.equal(errors.includes('STRIPE_SECRET_KEY is required'), true)
  assert.equal(errors.includes('RESEND_API_KEY is required'), true)
})

test('rejects unsafe URLs, key formats, and numeric options', () => {
  const errors = validateProductionEnv({
    ...validEnv,
    NEXT_PUBLIC_SERVER_URL: 'http://shop.example.com',
    MONGODB_URI: 'https://database.example.com',
    STRIPE_SECRET_KEY: 'secret-value',
    SENDER_EMAIL: 'invalid-email',
    PAGE_SIZE: '0',
    FREE_SHIPPING_MIN_PRICE: '-1',
  })

  assert.equal(
    errors.includes('NEXT_PUBLIC_SERVER_URL must use HTTPS outside localhost'),
    true
  )
  assert.equal(
    errors.includes('MONGODB_URI must use mongodb:// or mongodb+srv://'),
    true
  )
  assert.equal(errors.includes('STRIPE_SECRET_KEY must start with sk_'), true)
  assert.equal(errors.includes('SENDER_EMAIL must be a valid email address'), true)
  assert.equal(errors.includes('PAGE_SIZE must be a positive integer'), true)
  assert.equal(
    errors.includes('FREE_SHIPPING_MIN_PRICE must be a non-negative number'),
    true
  )
})

test('does not include secret values in validation errors', () => {
  const secretValue = 'super-secret-value-that-must-not-leak'
  const errors = validateProductionEnv({
    ...validEnv,
    AUTH_SECRET: 'short',
    STRIPE_SECRET_KEY: secretValue,
  })

  assert.equal(JSON.stringify(errors).includes(secretValue), false)
  assert.equal(JSON.stringify(errors).includes('short'), false)
})
