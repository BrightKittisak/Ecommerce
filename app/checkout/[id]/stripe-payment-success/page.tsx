import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import Stripe from 'stripe'

import { Button } from '@/components/ui/button'
import { getOrderByIdForCurrentUser } from '@/lib/actions/order.actions'

const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error('Missing environment variable: "STRIPE_SECRET_KEY"')
  }

  return new Stripe(secretKey)
}

export default async function SuccessPage(props: {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{ payment_intent: string }>
}) {
  const params = await props.params
  const { id } = params

  const searchParams = await props.searchParams
  const order = await getOrderByIdForCurrentUser(id)
  if (!order) notFound()

  const stripe = getStripeClient()
  const paymentIntent = await stripe.paymentIntents.retrieve(
    searchParams.payment_intent
  )
  if (
    paymentIntent.metadata.orderId == null ||
    paymentIntent.metadata.orderId !== order._id.toString()
  )
    return notFound()

  const isSuccess = paymentIntent.status === 'succeeded'
  if (!isSuccess) return redirect(`/checkout/${id}`)

  return (
    <div className='mx-auto max-w-4xl w-full space-y-8'>
      <div className='flex flex-col items-center gap-6'>
        <h1 className='text-2xl font-bold lg:text-3xl'>
          ขอบคุณสำหรับคำสั่งซื้อของคุณ
        </h1>
        <div>เรากำลังดำเนินการคำสั่งซื้อของคุณอยู่ตอนนี้</div>
        <Button asChild>
          <Link href={`/account/orders/${id}`}>ดูคำสั่งซื้อ</Link>
        </Button>
      </div>
    </div>
  )
}
