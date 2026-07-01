import { NextRequest, NextResponse } from 'next/server'

import { processStripeWebhookPayment } from '@/lib/application/orders/process-stripe-webhook-payment'
import { constructStripeWebhookEvent } from '@/lib/infrastructure/payments/stripe-payment-adapter'
import { stripeWebhookPaymentDeps } from '@/lib/infrastructure/payments/stripe-webhook-payment-deps'
import { logger } from '@/lib/logger'
import {
  readRequestTextWithLimit,
  RequestBodyTooLargeError,
} from '@/lib/request-body'
import {
  getStripeWebhookInvalidSignatureResponse,
  getStripeWebhookMissingSignatureResponse,
  getStripeWebhookPayloadTooLargeResponse,
  getStripeWebhookSignatureLogMetadata,
} from '@/lib/stripe-webhook-response'

const STRIPE_WEBHOOK_MAX_BODY_BYTES = 1024 * 1024

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      getStripeWebhookMissingSignatureResponse(),
      { status: 400 }
    )
  }

  let body: string
  try {
    body = await readRequestTextWithLimit(req, STRIPE_WEBHOOK_MAX_BODY_BYTES)
  } catch (error) {
    if (!(error instanceof RequestBodyTooLargeError)) throw error

    return NextResponse.json(
      getStripeWebhookPayloadTooLargeResponse(),
      { status: 413 }
    )
  }

  let event: ReturnType<typeof constructStripeWebhookEvent>
  try {
    event = constructStripeWebhookEvent({ body, signature })
  } catch (error) {
    logger.error(
      'stripe_webhook_invalid_signature',
      getStripeWebhookSignatureLogMetadata(error)
    )

    return NextResponse.json(
      getStripeWebhookInvalidSignatureResponse(),
      { status: 400 }
    )
  }

  if (event.type !== 'payment_intent.succeeded') {
    return NextResponse.json({ received: true })
  }

  const result = await processStripeWebhookPayment({
    paymentIntent: event.data.object,
    deps: stripeWebhookPaymentDeps,
  })

  if (result.status === 'completed' || result.status === 'already_processed') {
    return NextResponse.json({
      message: result.message,
    })
  }

  return NextResponse.json({ message: result.message }, { status: 400 })
}
