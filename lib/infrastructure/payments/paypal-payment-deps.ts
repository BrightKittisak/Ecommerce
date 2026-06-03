import type {
  PayPalPaymentDeps,
  PayPalPaymentOrder,
} from '@/lib/application/orders/process-paypal-payment'
import type { IOrder } from '@/lib/db/models/order.model'
import { incrementProductSales } from '@/lib/product-sales'

import {
  capturePayPalCheckoutOrder,
  createPayPalCheckoutOrder,
  verifyPayPalCheckoutCapture,
} from './paypal-payment-adapter'

export const paypalPaymentDeps: PayPalPaymentDeps = {
  createPaymentOrder: createPayPalCheckoutOrder,
  capturePayment: capturePayPalCheckoutOrder,
  verifyCapture: verifyPayPalCheckoutCapture,
  incrementSales: incrementProductSales,
  async sendReceipt(order: PayPalPaymentOrder) {
    const { sendPurchaseReceipt } = await import('../../../emails')
    await sendPurchaseReceipt({ order: order as IOrder })
  },
}
