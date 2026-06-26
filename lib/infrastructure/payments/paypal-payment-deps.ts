import type {
  PayPalPaymentDeps,
  PayPalPaymentOrder,
} from '@/lib/application/orders/process-paypal-payment'
import { connectToDatabase } from '@/lib/db'
import type { IOrder } from '@/lib/db/models/order.model'
import { logger, serializeLogError } from '@/lib/logger'
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
  async incrementSales(items) {
    await connectToDatabase()
    return incrementProductSales(items)
  },
  async sendReceipt(order: PayPalPaymentOrder) {
    const { sendPurchaseReceipt } = await import('../../../emails')
    await sendPurchaseReceipt({ order: order as IOrder })
  },
  logReceiptError({ paypalOrderId, error }) {
    logger.error('paypal.purchase_receipt_failed', {
      paypalOrderId,
      error: serializeLogError(error),
    })
  },
}
