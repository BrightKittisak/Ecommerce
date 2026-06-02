import { NextRequest, NextResponse } from 'next/server'

import { sendPurchaseReceipt } from '@/emails'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import { constructStripeWebhookEvent } from '@/lib/infrastructure/payments/stripe-payment-adapter'
import { logger, serializeLogError } from '@/lib/logger'
import { incrementProductSales } from '@/lib/product-sales'
import { verifyStripePaymentIntent } from '@/lib/stripe-payment-verification'

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

  const paymentIntent = event.data.object
  const orderId = paymentIntent.metadata.orderId

  if (!orderId) {
    return NextResponse.json(
      { message: 'Missing orderId in Stripe event metadata' },
      { status: 400 }
    )
  }

  const order = await Order.findById(orderId).populate('user', 'email')

  if (!order) {
    return NextResponse.json(
      { message: 'Order not found for this Stripe event' },
      { status: 400 }
    )
  }

  if (order.isPaid || order.paymentResult?.id === paymentIntent.id) {
    return NextResponse.json({
      message: 'Order payment already processed',
    })
  }

  let verifiedPayment
  try {
    verifiedPayment = verifyStripePaymentIntent({
      paymentIntent,
      expectedOrderId: order._id.toString(),
      expectedTotalPrice: order.totalPrice,
      expectedCurrencyCode: order.currencyCode,
      amountField: 'amount_received',
    })
  } catch {
    return NextResponse.json(
      { message: 'Stripe payment details do not match the order' },
      { status: 400 }
    )
  }

  order.isPaid = true
  order.paidAt = new Date(paymentIntent.created * 1000)
  order.paymentResult = {
    id: verifiedPayment.id,
    status: verifiedPayment.status,
    email_address: verifiedPayment.emailAddress,
    pricePaid: verifiedPayment.pricePaid,
  }
  await order.save()
  await incrementProductSales(order.items)

  try {
    await sendPurchaseReceipt({ order })
  } catch (error) {
    logger.error('stripe.purchase_receipt_failed', {
      orderId: order._id.toString(),
      paymentIntentId: paymentIntent.id,
      error: serializeLogError(error),
    })
  }

  return NextResponse.json({
    message: 'Order payment marked as completed',
  })
}
