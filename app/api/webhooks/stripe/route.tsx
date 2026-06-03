import { NextRequest, NextResponse } from 'next/server'

import { connectToDatabase } from '@/lib/db'
import { processStripeWebhookPayment } from '@/lib/application/orders/process-stripe-webhook-payment'
import { constructStripeWebhookEvent } from '@/lib/infrastructure/payments/stripe-payment-adapter'
import { stripeWebhookPaymentDeps } from '@/lib/infrastructure/payments/stripe-webhook-payment-deps'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { message: 'Missing Stripe signature header' },
      { status: 400 }
    )
  }

  let event: ReturnType<typeof constructStripeWebhookEvent>
  try {
    event = constructStripeWebhookEvent({ body, signature })
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Invalid Stripe webhook signature',
      },
      { status: 400 }
    )
  }

  if (event.type !== 'payment_intent.succeeded') {
    return NextResponse.json({ received: true })
  }

  await connectToDatabase()

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
