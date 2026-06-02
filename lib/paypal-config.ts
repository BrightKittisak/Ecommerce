type PayPalEnv = {
  [key: string]: string | undefined
}

const requirePayPalEnv = (env: PayPalEnv, key: string) => {
  const value = env[key]

  if (!value) {
    throw new Error(`Missing environment variable: "${key}"`)
  }

  return value
}

export function getPayPalApiBaseUrl(env: PayPalEnv = process.env) {
  return requirePayPalEnv(env, 'PAYPAL_API_URL')
}

export function getPayPalClientId(env: PayPalEnv = process.env) {
  return requirePayPalEnv(env, 'PAYPAL_CLIENT_ID')
}

export function getPayPalAppSecret(env: PayPalEnv = process.env) {
  return requirePayPalEnv(env, 'PAYPAL_APP_SECRET')
}
