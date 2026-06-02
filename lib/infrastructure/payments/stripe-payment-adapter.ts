import { formatStripeAmountInCents } from '../../stripe-payment-verification'
import { getStripeClient } from '../../stripe'
import { CURRENCY_CODE } from '../../utils'

type StripeCheckoutPaymentIntentInput = {
  orderId: string
  totalPrice: number
  currencyCode?: string
}

export const buildStripeCheckoutPaymentIntentParams = ({
  orderId,
  totalPrice,
  currencyCode = CURRENCY_CODE,
}: StripeCheckoutPaymentIntentInput) => {
  return {
    amount: formatStripeAmountInCents(totalPrice),
    currency: currencyCode.toLowerCase(),
    metadata: { orderId },
  }
}

export async function createStripeCheckoutPaymentIntent({
  orderId,
  totalPrice,
  currencyCode,
}: StripeCheckoutPaymentIntentInput) {
  const stripe = getStripeClient()
  const paymentIntent = await stripe.paymentIntents.create(
    buildStripeCheckoutPaymentIntentParams({
      orderId,
      totalPrice,
      currencyCode,
    })
  )

  return paymentIntent.client_secret
}

export async function retrieveStripePaymentIntent(paymentIntentId: string) {
  const stripe = getStripeClient()
  return stripe.paymentIntents.retrieve(paymentIntentId)
}
