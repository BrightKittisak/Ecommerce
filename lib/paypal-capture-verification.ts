import { CURRENCY_CODE, round2 } from './utils'

type PayPalCaptureVerificationInput = {
  captureData: {
    id?: string
    status?: string
    payer?: {
      email_address?: string
    }
    purchase_units?: Array<{
      payments?: {
        captures?: Array<{
          id?: string
          status?: string
          amount?: {
            currency_code?: string
            value?: string
          }
        }>
      }
    }>
  }
  expectedOrderId: string
  expectedTotalPrice: number
  expectedCurrencyCode?: string
}

export type VerifiedPayPalCapture = {
  captureId: string
  status: string
  payerEmail: string
  pricePaid: string
}

export const formatPayPalAmount = (amount: number) =>
  round2(amount).toFixed(2)

export function verifyPayPalCapture({
  captureData,
  expectedOrderId,
  expectedTotalPrice,
  expectedCurrencyCode = CURRENCY_CODE,
}: PayPalCaptureVerificationInput): VerifiedPayPalCapture {
  const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0]
  const capturedAmount = capture?.amount

  if (
    captureData.id !== expectedOrderId ||
    captureData.status !== 'COMPLETED' ||
    capture?.status !== 'COMPLETED' ||
    !capture.id ||
    capturedAmount?.currency_code !== expectedCurrencyCode ||
    capturedAmount?.value !== formatPayPalAmount(expectedTotalPrice)
  ) {
    throw new Error('Invalid PayPal capture')
  }

  return {
    captureId: capture.id,
    status: capture.status,
    payerEmail: captureData.payer?.email_address || '',
    pricePaid: capturedAmount.value,
  }
}
