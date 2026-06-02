import Stripe from 'stripe'

export function getStripeSecretKey() {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error('Missing environment variable: "STRIPE_SECRET_KEY"')
  }

  return secretKey
}

export function getStripeWebhookSecret() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('Missing environment variable: "STRIPE_WEBHOOK_SECRET"')
  }

  return webhookSecret
}

export function getStripeClient() {
  return new Stripe(getStripeSecretKey())
}
