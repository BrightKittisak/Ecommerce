import Link from 'next/link'
import { notFound } from 'next/navigation'

import { auth } from '@/auth'
import OrderDetailsForm from '@/components/shared/order/order-details-form'
import { getOrderByIdForCurrentUser } from '@/lib/actions/order.actions'
import { formatId } from '@/lib/utils'

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params

  return {
    title: `คำสั่งซื้อ ${formatId(params.id)}`,
  }
}

export default async function OrderDetailsPage(props: {
  params: Promise<{
    id: string
  }>
}) {
  const params = await props.params
  const { id } = params

  const order = await getOrderByIdForCurrentUser(id)
  if (!order) notFound()

  const session = await auth()

  return (
    <>
      <div className='flex gap-2'>
        <Link href='/account'>บัญชีของคุณ</Link>
        <span>/</span>
        <Link href='/account/orders'>คำสั่งซื้อของคุณ</Link>
        <span>/</span>
        <span>คำสั่งซื้อ {formatId(order._id)}</span>
      </div>
      <h1 className='h1-bold py-4'>คำสั่งซื้อ {formatId(order._id)}</h1>
      <OrderDetailsForm
        order={order}
        isAdmin={session?.user?.role === 'Admin' || false}
      />
    </>
  )
}
