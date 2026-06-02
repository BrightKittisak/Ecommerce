import { notFound } from 'next/navigation'
import React from 'react'

import { auth } from '@/auth'
import { getOrderByIdForCurrentUser } from '@/lib/actions/order.actions'
import { getPayPalClientId } from '@/lib/paypal-config'
import { createStripeCheckoutPaymentIntent } from '@/lib/infrastructure/payments/stripe-payment-adapter'

import PaymentForm from './payment-form'

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
    client_secret = await createStripeCheckoutPaymentIntent({
      orderId: order._id.toString(),
      totalPrice: order.totalPrice,
    })
  }

  return (
    <PaymentForm
      order={order}
      paypalClientId={getPayPalClientId()}
      clientSecret={client_secret}
      isAdmin={session?.user?.role === 'Admin' || false}
    />
  )
}

export default CheckoutPaymentPage
