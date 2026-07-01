import { serializeLogError } from './logger'

export const STRIPE_WEBHOOK_INVALID_SIGNATURE_MESSAGE =
  'Invalid Stripe webhook signature'
export const STRIPE_WEBHOOK_PAYLOAD_TOO_LARGE_MESSAGE =
  'Stripe webhook payload is too large'

export const getStripeWebhookInvalidSignatureResponse = () => ({
  message: STRIPE_WEBHOOK_INVALID_SIGNATURE_MESSAGE,
})

export const getStripeWebhookMissingSignatureResponse =
  getStripeWebhookInvalidSignatureResponse

export const getStripeWebhookPayloadTooLargeResponse = () => ({
  message: STRIPE_WEBHOOK_PAYLOAD_TOO_LARGE_MESSAGE,
})

export const getStripeWebhookSignatureLogMetadata = (error: unknown) => ({
  error: serializeLogError(error),
})
