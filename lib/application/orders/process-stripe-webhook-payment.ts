import Order, { IOrder } from '../../db/models/order.model'
import { logger, serializeLogError } from '../../logger'
import { incrementProductSales } from '../../product-sales'
import {
  StripePaymentIntentLike,
  verifyStripePaymentIntent,
} from '../../stripe-payment-verification'
import type { OrderItem } from '@/types'

type OrderPaymentResultRecord = {
  id?: string
  status?: string
  email_address?: string
  pricePaid?: string
}

export type StripeWebhookOrder = {
  _id: {
    toString(): string
  }
  totalPrice: number
  currencyCode: string
  isPaid: boolean
  paymentResult?: OrderPaymentResultRecord
  paidAt?: Date
  items: OrderItem[]
  save(): Promise<unknown>
}

type ProcessStripeWebhookPaymentDeps = {
  findOrderById(orderId: string): Promise<StripeWebhookOrder | null>
  incrementSales(items: OrderItem[]): Promise<void>
  sendReceipt(order: StripeWebhookOrder): Promise<void>
  logReceiptError(input: {
    orderId: string
    paymentIntentId: string
    error: unknown
  }): void
}

type ProcessStripeWebhookPaymentInput = {
  paymentIntent: StripePaymentIntentLike
  deps?: ProcessStripeWebhookPaymentDeps
}

export type ProcessStripeWebhookPaymentResult =
  | {
      status: 'missing_order_id'
      message: 'Missing orderId in Stripe event metadata'
    }
  | {
      status: 'order_not_found'
      message: 'Order not found for this Stripe event'
    }
  | {
      status: 'already_processed'
      message: 'Order payment already processed'
    }
  | {
      status: 'invalid_payment'
      message: 'Stripe payment details do not match the order'
    }
  | {
      status: 'completed'
      message: 'Order payment marked as completed'
    }

const defaultDeps: ProcessStripeWebhookPaymentDeps = {
  async findOrderById(orderId) {
    const order = await Order.findById(orderId).populate('user', 'email')
    return order
  },
  incrementSales: incrementProductSales,
  async sendReceipt(order) {
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

export async function processStripeWebhookPayment({
  paymentIntent,
  deps = defaultDeps,
}: ProcessStripeWebhookPaymentInput): Promise<ProcessStripeWebhookPaymentResult> {
  const orderId = paymentIntent.metadata?.orderId

  if (!orderId) {
    return {
      status: 'missing_order_id',
      message: 'Missing orderId in Stripe event metadata',
    }
  }

  const order = await deps.findOrderById(orderId)

  if (!order) {
    return {
      status: 'order_not_found',
      message: 'Order not found for this Stripe event',
    }
  }

  if (order.isPaid || order.paymentResult?.id === paymentIntent.id) {
    return {
      status: 'already_processed',
      message: 'Order payment already processed',
    }
  }

  let verifiedPayment
  try {
    verifiedPayment = verifyStripePaymentIntent({
      paymentIntent,
      expectedOrderId: order._id.toString(),
      expectedTotalPrice: order.totalPrice,
      expectedCurrencyCode: order.currencyCode,
      amountField: 'amount_received',
    })
  } catch {
    return {
      status: 'invalid_payment',
      message: 'Stripe payment details do not match the order',
    }
  }

  order.isPaid = true
  order.paidAt = new Date(paymentIntent.created * 1000)
  order.paymentResult = {
    id: verifiedPayment.id,
    status: verifiedPayment.status,
    email_address: verifiedPayment.emailAddress,
    pricePaid: verifiedPayment.pricePaid,
  }
  await order.save()
  await deps.incrementSales(order.items)

  try {
    await deps.sendReceipt(order)
  } catch (error) {
    deps.logReceiptError({
      orderId: order._id.toString(),
      paymentIntentId: paymentIntent.id,
      error,
    })
  }

  return {
    status: 'completed',
    message: 'Order payment marked as completed',
  }
}
