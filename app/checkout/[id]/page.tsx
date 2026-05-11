import { notFound } from "next/navigation";
import React from "react";
import Stripe from "stripe";
import { auth } from "@/auth";
import { getOrderByIdForCurrentUser } from "@/lib/actions/order.actions";
import { CURRENCY_CODE } from "@/lib/utils";
import PaymentForm from "./payment-form";

export const metadata = {
  title: 'ชำระเงิน',
}

const CheckoutPaymentPage = async (props: {
  params: Promise<{
    id: string
  }>
}) => {
  const params = await props.params

  const { id } = params

  const order = await getOrderByIdForCurrentUser(id)
  if (!order) notFound()

  const session = await auth()

  let client_secret = null
  if (order.paymentMethod === 'Stripe' && !order.isPaid) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100),
      currency: CURRENCY_CODE.toLowerCase(),
      metadata: { orderId: order._id.toString() },
    })
    client_secret = paymentIntent.client_secret
  }

  return (
    <PaymentForm
      order={order}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
      clientSecret={client_secret}
      isAdmin={session?.user?.role === 'Admin' || false}
    />
  )
}

export default CheckoutPaymentPage
