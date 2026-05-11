import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { sendPurchaseReceipt } from '@/emails'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'

const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error('Missing environment variable: "STRIPE_SECRET_KEY"')
  }

  return new Stripe(secretKey)
}

export async function POST(req: NextRequest) {
  const stripe = getStripeClient()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('Missing environment variable: "STRIPE_WEBHOOK_SECRET"')
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { message: 'Missing Stripe signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
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

  if (event.type !== 'charge.succeeded') {
    return NextResponse.json({ received: true })
  }

  await connectToDatabase()

  const charge = event.data.object
  const orderId = charge.metadata.orderId
  const email = charge.billing_details.email
  const pricePaidInCents = charge.amount
  const order = await Order.findById(orderId).populate('user', 'email')

  if (!order) {
    return NextResponse.json(
      { message: 'Order not found for this Stripe event' },
      { status: 400 }
    )
  }

  // Stripe may retry webhook delivery. Treat repeated events as success
  // without sending duplicate receipts or mutating the order again.
  if (order.isPaid || order.paymentResult?.id === event.id) {
    return NextResponse.json({
      message: 'Order payment already processed',
    })
  }

  order.isPaid = true
  order.paidAt = new Date()
  order.paymentResult = {
    id: event.id,
    status: 'COMPLETED',
    email_address: email ?? '',
    pricePaid: (pricePaidInCents / 100).toFixed(2),
  }
  await order.save()

  try {
    await sendPurchaseReceipt({ order })
  } catch (error) {
    console.log('Failed to send Stripe purchase receipt', error)
  }

  return NextResponse.json({
    message: 'Order payment marked as completed',
  })
}
