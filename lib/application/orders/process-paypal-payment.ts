import type { OrderItem } from '../../../types'
import type { IOrder } from '../../db/models/order.model'
import {
  capturePayPalCheckoutOrder,
  createPayPalCheckoutOrder,
  verifyPayPalCheckoutCapture,
} from '../../infrastructure/payments/paypal-payment-adapter'
import { PayPalCaptureLike } from '../../paypal-capture-verification'
import { incrementProductSales } from '../../product-sales'

type OrderPaymentResultRecord = {
  id?: string
  status?: string
  email_address?: string
  pricePaid?: string
}

export type PayPalPaymentOrder = {
  totalPrice: number
  isPaid: boolean
  paymentResult?: OrderPaymentResultRecord
  paidAt?: Date
  items: OrderItem[]
  save(): Promise<unknown>
  populate(path: string, select?: string): Promise<unknown>
}

type PayPalPaymentDeps = {
  createPaymentOrder(totalPrice: number): Promise<{ id: string }>
  capturePayment(paypalOrderId: string): Promise<PayPalCaptureLike>
  verifyCapture(input: {
    captureData: PayPalCaptureLike
    expectedOrderId: string
    expectedTotalPrice: number
  }): {
    captureId: string
    status: string
    payerEmail: string
    pricePaid: string
  }
  incrementSales(items: OrderItem[]): Promise<void>
  sendReceipt(order: PayPalPaymentOrder): Promise<void>
}

type CreatePayPalPaymentOrderInput = {
  order: PayPalPaymentOrder
  deps?: PayPalPaymentDeps
}

type ApprovePayPalPaymentOrderInput = {
  order: PayPalPaymentOrder
  paypalOrderId: string
  deps?: PayPalPaymentDeps
}

export type CreatePayPalPaymentOrderResult =
  | {
      status: 'already_processed'
    }
  | {
      status: 'created'
      paypalOrderId: string
    }

export type ApprovePayPalPaymentOrderResult =
  | {
      status: 'already_processed'
    }
  | {
      status: 'completed'
    }

const defaultDeps: PayPalPaymentDeps = {
  createPaymentOrder: createPayPalCheckoutOrder,
  capturePayment: capturePayPalCheckoutOrder,
  verifyCapture: verifyPayPalCheckoutCapture,
  incrementSales: incrementProductSales,
  async sendReceipt(order) {
    const { sendPurchaseReceipt } = await import('../../../emails')
    await sendPurchaseReceipt({ order: order as IOrder })
  },
}

export async function createPayPalPaymentOrder({
  order,
  deps = defaultDeps,
}: CreatePayPalPaymentOrderInput): Promise<CreatePayPalPaymentOrderResult> {
  if (order.isPaid) {
    return {
      status: 'already_processed',
    }
  }

  const paypalOrder = await deps.createPaymentOrder(order.totalPrice)
  order.paymentResult = {
    id: paypalOrder.id,
    email_address: '',
    status: '',
    pricePaid: '0',
  }
  await order.save()

  return {
    status: 'created',
    paypalOrderId: paypalOrder.id,
  }
}

export async function approvePayPalPaymentOrder({
  order,
  paypalOrderId,
  deps = defaultDeps,
}: ApprovePayPalPaymentOrderInput): Promise<ApprovePayPalPaymentOrderResult> {
  if (order.isPaid) {
    return {
      status: 'already_processed',
    }
  }

  if (paypalOrderId !== order.paymentResult?.id) {
    throw new Error('รายการชำระเงิน PayPal ไม่ตรงกับคำสั่งซื้อนี้')
  }

  const captureData = await deps.capturePayment(paypalOrderId)
  let verifiedCapture
  try {
    verifiedCapture = deps.verifyCapture({
      captureData,
      expectedOrderId: paypalOrderId,
      expectedTotalPrice: order.totalPrice,
    })
  } catch {
    throw new Error('เกิดข้อผิดพลาดในการชำระเงินผ่าน PayPal')
  }

  order.isPaid = true
  order.paidAt = new Date()
  order.paymentResult = {
    id: verifiedCapture.captureId,
    status: verifiedCapture.status,
    email_address: verifiedCapture.payerEmail,
    pricePaid: verifiedCapture.pricePaid,
  }
  await order.populate('user', 'email')
  await order.save()
  await deps.incrementSales(order.items)
  await deps.sendReceipt(order)

  return {
    status: 'completed',
  }
}
