import { paypal } from '../../paypal'
import {
  PayPalCaptureLike,
  verifyPayPalCapture,
} from '../../paypal-capture-verification'

type VerifyPayPalCheckoutCaptureInput = {
  captureData: PayPalCaptureLike
  expectedOrderId: string
  expectedTotalPrice: number
  expectedCurrencyCode?: string
}

export async function createPayPalCheckoutOrder(totalPrice: number) {
  return paypal.createOrder(totalPrice)
}

export async function capturePayPalCheckoutOrder(paypalOrderId: string) {
  return paypal.capturePayment(paypalOrderId)
}

export function verifyPayPalCheckoutCapture(
  input: VerifyPayPalCheckoutCaptureInput
) {
  return verifyPayPalCapture(input)
}
