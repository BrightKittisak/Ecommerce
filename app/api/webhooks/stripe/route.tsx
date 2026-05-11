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

  const event = stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get('stripe-signature') as string,
    webhookSecret
  )

  if (event.type === 'charge.succeeded') {
    await connectToDatabase()
    const charge = event.data.object
    const orderId = charge.metadata.orderId
    const email = charge.billing_details.email
    const pricePaidInCents = charge.amount
    const order = await Order.findById(orderId).populate('user', 'email')
    if (order == null) {
      return new NextResponse('คำขอไม่ถูกต้อง', { status: 400 })
    }

    order.isPaid = true
    order.paidAt = new Date()
    order.paymentResult = {
      id: event.id,
      status: 'COMPLETED',
      email_address: email!,
      pricePaid: (pricePaidInCents / 100).toFixed(2),
    }
    await order.save()
    try {
      await sendPurchaseReceipt({ order })
    } catch (err) {
      console.log('เกิดข้อผิดพลาดในการส่งอีเมล', err)
    }
    return NextResponse.json({
      message: 'อัปเดตสถานะคำสั่งซื้อเป็นชำระเงินแล้วเรียบร้อย',
    })
  }
  return new NextResponse()
}
