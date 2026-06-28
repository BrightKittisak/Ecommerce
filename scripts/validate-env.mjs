#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs'

export const REQUIRED_ENV_NAMES = [
  'AUTH_GOOGLE_ID',
  'AUTH_GOOGLE_SECRET',
  'AUTH_SECRET',
  'MONGODB_URI',
  'NEXT_PUBLIC_SERVER_URL',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'PAYPAL_API_URL',
  'PAYPAL_APP_SECRET',
  'PAYPAL_CLIENT_ID',
  'RESEND_API_KEY',
  'SENDER_EMAIL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
]

function isPresent(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export function parseDotEnv(contents) {
  const values = {}

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line || line.startsWith('#')) continue

    const normalizedLine = line.startsWith('export ') ? line.slice(7) : line
    const separatorIndex = normalizedLine.indexOf('=')

    if (separatorIndex <= 0) continue

    const name = normalizedLine.slice(0, separatorIndex).trim()
    let value = normalizedLine.slice(separatorIndex + 1).trim()

    if (!/^[A-Z_][A-Z0-9_]*$/.test(name)) continue

    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1)
    }

    values[name] = value
  }

  return values
}

export function getEnvironmentForValidation(
  processEnv = process.env,
  envFilePath = '.env'
) {
  const fileEnv = existsSync(envFilePath)
    ? parseDotEnv(readFileSync(envFilePath, 'utf8'))
    : {}

  return { ...fileEnv, ...processEnv }
}

function isAbsoluteHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isLocalUrl(value) {
  try {
    const hostname = new URL(value).hostname
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return false
  }
}

export function validateProductionEnv(env = {}) {
  const errors = []

  for (const name of REQUIRED_ENV_NAMES) {
    if (!isPresent(env[name])) {
      errors.push(`${name} is required`)
    }
  }

  if (isPresent(env.AUTH_SECRET) && env.AUTH_SECRET.length < 32) {
    errors.push('AUTH_SECRET must contain at least 32 characters')
  }

  if (
    isPresent(env.MONGODB_URI) &&
    !/^mongodb(?:\+srv)?:\/\//.test(env.MONGODB_URI)
  ) {
    errors.push('MONGODB_URI must use mongodb:// or mongodb+srv://')
  }

  for (const name of ['NEXT_PUBLIC_SERVER_URL', 'PAYPAL_API_URL']) {
    const value = env[name]

    if (isPresent(value) && !isAbsoluteHttpUrl(value)) {
      errors.push(`${name} must be an absolute HTTP or HTTPS URL`)
    }
  }

  if (
    isPresent(env.NEXT_PUBLIC_SERVER_URL) &&
    !isLocalUrl(env.NEXT_PUBLIC_SERVER_URL) &&
    !env.NEXT_PUBLIC_SERVER_URL.startsWith('https://')
  ) {
    errors.push('NEXT_PUBLIC_SERVER_URL must use HTTPS outside localhost')
  }

  const prefixedSecrets = [
    ['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'pk_'],
    ['RESEND_API_KEY', 're_'],
    ['STRIPE_SECRET_KEY', 'sk_'],
    ['STRIPE_WEBHOOK_SECRET', 'whsec_'],
  ]

  for (const [name, prefix] of prefixedSecrets) {
    const value = env[name]

    if (isPresent(value) && !value.startsWith(prefix)) {
      errors.push(`${name} must start with ${prefix}`)
    }
  }

  if (
    isPresent(env.SENDER_EMAIL) &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.SENDER_EMAIL)
  ) {
    errors.push('SENDER_EMAIL must be a valid email address')
  }

  if (
    isPresent(env.PAGE_SIZE) &&
    (!Number.isInteger(Number(env.PAGE_SIZE)) || Number(env.PAGE_SIZE) <= 0)
  ) {
    errors.push('PAGE_SIZE must be a positive integer')
  }

  if (
    isPresent(env.FREE_SHIPPING_MIN_PRICE) &&
    (!Number.isFinite(Number(env.FREE_SHIPPING_MIN_PRICE)) ||
      Number(env.FREE_SHIPPING_MIN_PRICE) < 0)
  ) {
    errors.push('FREE_SHIPPING_MIN_PRICE must be a non-negative number')
  }

  return errors
}

function main() {
  const errors = validateProductionEnv(getEnvironmentForValidation())

  if (errors.length === 0) {
    console.log('Environment validation passed')
    return
  }

  console.error('Environment validation failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exitCode = 1
}

if (process.argv[1]?.endsWith('validate-env.mjs')) {
  main()
}
