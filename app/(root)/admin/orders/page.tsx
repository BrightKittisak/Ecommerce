import Link from 'next/link'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/auth'
import Pagination from '@/components/shared/pagination'
import ProductPrice from '@/components/shared/product/product-price'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PAGE_SIZE } from '@/lib/constants'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import { formatDateTime, formatId } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'คำสั่งซื้อทั้งหมด',
}

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage(props: {
  searchParams: Promise<{ page?: string }>
}) {
  const session = await auth()

  if (!session) {
    redirect('/sign-in')
  }

  if (session.user.role !== 'Admin') {
    notFound()
  }

  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const limit = PAGE_SIZE
  const skipAmount = (page - 1) * limit

  await connectToDatabase()

  const [ordersRaw, ordersCount] = await Promise.all([
    Order.find({})
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(limit)
      .populate('user', 'name email')
      .lean(),
    Order.countDocuments(),
  ])

  const orders = ordersRaw.map((order) => ({
    _id: String(order._id),
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    deliveredAt: order.deliveredAt,
    isPaid: order.isPaid,
    isDelivered: order.isDelivered,
    totalPrice: order.totalPrice,
    customerName:
      typeof order.user === 'object' &&
      order.user &&
      'name' in order.user &&
      typeof order.user.name === 'string'
        ? order.user.name
        : 'ลูกค้าที่ไม่ได้ระบุชื่อ',
  }))

  return (
    <div className='mx-auto w-full max-w-6xl space-y-6'>
      <div className='section-shell p-6 md:p-8'>
        <p className='eyebrow mb-3'>คำสั่งซื้อทั้งระบบ</p>
        <h1 className='h1-bold'>จัดการคำสั่งซื้อของร้าน</h1>
        <p className='mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base'>
          ดูออเดอร์ล่าสุด ตรวจสอบสถานะการชำระเงิน และกดเข้าไปดูรายละเอียดรายคำสั่งซื้อได้จากหน้านี้
        </p>
      </div>

      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัส</TableHead>
              <TableHead>ลูกค้า</TableHead>
              <TableHead>วันที่สั่งซื้อ</TableHead>
              <TableHead>ยอดรวม</TableHead>
              <TableHead>ชำระแล้ว</TableHead>
              <TableHead>จัดส่งแล้ว</TableHead>
              <TableHead>จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>ยังไม่มีคำสั่งซื้อในระบบ</TableCell>
              </TableRow>
            )}
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{formatId(order._id)}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{formatDateTime(order.createdAt).dateTime}</TableCell>
                <TableCell>
                  <ProductPrice price={order.totalPrice} plain />
                </TableCell>
                <TableCell>
                  {order.isPaid && order.paidAt
                    ? formatDateTime(order.paidAt).dateTime
                    : 'รอชำระ'}
                </TableCell>
                <TableCell>
                  {order.isDelivered && order.deliveredAt
                    ? formatDateTime(order.deliveredAt).dateTime
                    : 'ยังไม่จัดส่ง'}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/account/orders/${order._id}`}
                    className='text-primary transition-colors hover:text-primary/80'
                  >
                    รายละเอียด
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {ordersCount > limit && (
        <Pagination page={page} totalPages={Math.ceil(ordersCount / limit)} />
      )}
    </div>
  )
}
