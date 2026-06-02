import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { getOrderByIdForCurrentUser } from '@/lib/actions/order.actions'
import { retrieveStripePaymentIntent } from '@/lib/infrastructure/payments/stripe-payment-adapter'
import { verifyStripePaymentIntent } from '@/lib/stripe-payment-verification'

export default async function SuccessPage(props: {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{ payment_intent?: string }>
}) {
  const params = await props.params
  const { id } = params

  const searchParams = await props.searchParams
  if (!searchParams.payment_intent) {
    return redirect(`/checkout/${id}`)
  }

  const order = await getOrderByIdForCurrentUser(id)
  if (!order) notFound()

  const paymentIntent = await retrieveStripePaymentIntent(
    searchParams.payment_intent
  )

  try {
    verifyStripePaymentIntent({
      paymentIntent,
      expectedOrderId: order._id.toString(),
      expectedTotalPrice: order.totalPrice,
      expectedCurrencyCode: order.currencyCode,
      amountField: 'amount',
      requireSucceeded: false,
    })
  } catch {
    return notFound()
  }

  if (paymentIntent.status !== 'succeeded') {
    return redirect(`/checkout/${id}`)
  }

  const isPaymentFinalized =
    order.isPaid && order.paymentResult?.id === paymentIntent.id

  return (
    <div className='mx-auto max-w-4xl w-full space-y-8'>
      <div className='flex flex-col items-center gap-6'>
        <h1 className='text-2xl font-bold lg:text-3xl'>
          {isPaymentFinalized
            ? 'ขอบคุณสำหรับคำสั่งซื้อของคุณ'
            : 'เราได้รับการชำระเงินแล้ว และกำลังยืนยันคำสั่งซื้อของคุณ'}
        </h1>
        <div>
          {isPaymentFinalized
            ? 'เรากำลังดำเนินการคำสั่งซื้อของคุณอยู่ตอนนี้'
            : 'ระบบจะอัปเดตหน้าคำสั่งซื้อทันทีที่ webhook จาก Stripe ยืนยันเสร็จสมบูรณ์'}
        </div>
        <Button asChild>
          <Link href={`/account/orders/${id}`}>ดูคำสั่งซื้อ</Link>
        </Button>
      </div>
    </div>
  )
}
