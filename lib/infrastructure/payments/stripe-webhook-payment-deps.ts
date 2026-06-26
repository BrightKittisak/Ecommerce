import type {
  ProcessStripeWebhookPaymentDeps,
  StripeWebhookOrder,
} from '@/lib/application/orders/process-stripe-webhook-payment'
import { connectToDatabase } from '@/lib/db'
import Order, { type IOrder } from '@/lib/db/models/order.model'
import { logger, serializeLogError } from '@/lib/logger'
import { incrementProductSales } from '@/lib/product-sales'

export const stripeWebhookPaymentDeps: ProcessStripeWebhookPaymentDeps = {
  async findOrderById(orderId) {
    await connectToDatabase()
    return Order.findById(orderId).populate('user', 'email')
  },
  async incrementSales(items) {
    await connectToDatabase()
    return incrementProductSales(items)
  },
  async sendReceipt(order: StripeWebhookOrder) {
    const { sendPurchaseReceipt } = await import('../../../emails')
    await sendPurchaseReceipt({ order: order as IOrder })
  },
  logReceiptError({ orderId, paymentIntentId, error }) {
    logger.error('stripe.purchase_receipt_failed', {
      orderId,
      paymentIntentId,
      error: serializeLogError(error),
    })
  },
}
