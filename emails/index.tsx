import { Resend } from 'resend'

import { IOrder } from '@/lib/db/models/order.model'
import { SENDER_EMAIL, SENDER_NAME } from '@/lib/constants'

import PurchaseReceiptEmail from './purchase-receipt'

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error('Missing environment variable: "RESEND_API_KEY"')
  }

  return new Resend(apiKey)
}

export const sendPurchaseReceipt = async ({ order }: { order: IOrder }) => {
  const resend = getResendClient()

  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: (order.user as { email: string }).email,
    subject: 'ยืนยันคำสั่งซื้อ',
    react: <PurchaseReceiptEmail order={order} />,
  })
}
