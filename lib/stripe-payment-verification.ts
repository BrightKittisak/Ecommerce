export type StripePaymentIntentLike = {
  id: string
  status: string
  created: number
  amount?: number
  amount_received?: number
  currency: string
  receipt_email?: string | null
  metadata?: {
    orderId?: string
  }
}

type StripePaymentVerificationInput = {
  paymentIntent: StripePaymentIntentLike
  expectedOrderId: string
  expectedTotalPrice: number
  expectedCurrencyCode: string
  amountField: 'amount' | 'amount_received'
  requireSucceeded?: boolean
}

export type VerifiedStripePayment = {
  id: string
  status: string
  emailAddress: string
  pricePaid: string
}

export const formatStripeAmountInCents = (amount: number) =>
  Math.round(amount * 100)

export function verifyStripePaymentIntent({
  paymentIntent,
  expectedOrderId,
  expectedTotalPrice,
  expectedCurrencyCode,
  amountField,
  requireSucceeded = true,
}: StripePaymentVerificationInput): VerifiedStripePayment {
  const expectedAmountInCents = formatStripeAmountInCents(expectedTotalPrice)
  const paymentAmount = paymentIntent[amountField]

  if (
    paymentIntent.metadata?.orderId !== expectedOrderId ||
    (requireSucceeded && paymentIntent.status !== 'succeeded') ||
    paymentIntent.currency !== expectedCurrencyCode.toLowerCase() ||
    paymentAmount !== expectedAmountInCents
  ) {
    throw new Error('Invalid Stripe payment intent')
  }

  return {
    id: paymentIntent.id,
    status: paymentIntent.status.toUpperCase(),
    emailAddress: paymentIntent.receipt_email ?? '',
    pricePaid: (paymentAmount / 100).toFixed(2),
  }
}
