import { serializeLogError } from './logger'

export const STRIPE_WEBHOOK_INVALID_SIGNATURE_MESSAGE =
  'Invalid Stripe webhook signature'

export const getStripeWebhookInvalidSignatureResponse = () => ({
  message: STRIPE_WEBHOOK_INVALID_SIGNATURE_MESSAGE,
})

export const getStripeWebhookMissingSignatureResponse =
  getStripeWebhookInvalidSignatureResponse

export const getStripeWebhookSignatureLogMetadata = (error: unknown) => ({
  error: serializeLogError(error),
})
