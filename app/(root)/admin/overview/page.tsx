import Link from 'next/link'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import {
  BadgeDollarSign,
  ClipboardList,
  Package,
  ShoppingBag,
  UserRound,
} from 'lucide-react'

import { auth } from '@/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import Product from '@/lib/db/models/product.model'
import User from '@/lib/db/models/user.model'
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'ภาพรวมระบบหลังบ้าน',
}

export const dynamic = 'force-dynamic'

type RecentOrder = {
  _id: string
  createdAt: Date
  totalPrice: number
  isPaid: boolean
  customerName: string
}

export default async function AdminOverviewPage() {
  const session = await auth()

  if (!session) {
    redirect('/sign-in')
  }

  if (session.user.role !== 'Admin') {
    notFound()
  }

  await connectToDatabase()

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    paidOrders,
    lowStockProducts,
    salesAgg,
    recentOrdersRaw,
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ isPaid: true }),
    Product.countDocuments({ countInStock: { $lte: 5 } }),
    Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
    ]),
    Order.find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('user', 'name')
      .lean(),
  ])

  const totalRevenue = salesAgg[0]?.totalRevenue ?? 0
  const recentOrders = recentOrdersRaw.map((order) => ({
    _id: String(order._id),
    createdAt: order.createdAt,
    totalPrice: order.totalPrice,
    isPaid: order.isPaid,
    customerName:
      typeof order.user === 'object' &&
      order.user &&
      'name' in order.user &&
      typeof order.user.name === 'string'
        ? order.user.name
        : 'ลูกค้าที่ไม่ได้ระบุชื่อ',
  })) as RecentOrder[]

  const statCards = [
    {
      title: 'ยอดขายรวม',
      value: formatCurrency(totalRevenue),
      hint: `${formatNumber(paidOrders)} ออเดอร์ที่ชำระเงินแล้ว`,
      icon: BadgeDollarSign,
    },
    {
      title: 'คำสั่งซื้อทั้งหมด',
      value: formatNumber(totalOrders),
      hint: `ชำระแล้ว ${formatNumber(paidOrders)} รายการ`,
      icon: ClipboardList,
    },
    {
      title: 'สินค้าทั้งหมด',
      value: formatNumber(totalProducts),
      hint: `สต็อกใกล้หมด ${formatNumber(lowStockProducts)} รายการ`,
      icon: Package,
    },
    {
      title: 'ผู้ใช้งาน',
      value: formatNumber(totalUsers),
      hint: 'นับจากบัญชีที่อยู่ในระบบ',
      icon: UserRound,
    },
  ]

  return (
    <div className='mx-auto flex w-full max-w-6xl flex-col gap-6'>
      <div className='section-shell p-6 md:p-8'>
        <p className='eyebrow mb-3'>ศูนย์ดูแลร้านค้า</p>
        <h1 className='h1-bold'>ภาพรวมระบบหลังบ้าน</h1>
        <p className='mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base'>
          ดูภาพรวมยอดขาย คำสั่งซื้อ สต็อกสินค้า และรายการล่าสุดของร้านได้จากหน้านี้
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {statCards.map((item) => {
          const Icon = item.icon

          return (
            <Card key={item.title} className='border-border/60 bg-card/90'>
              <CardContent className='flex items-start justify-between gap-4 p-6'>
                <div className='space-y-2'>
                  <p className='text-sm text-muted-foreground'>{item.title}</p>
                  <p className='text-2xl font-semibold text-foreground'>
                    {item.value}
                  </p>
                  <p className='text-sm text-muted-foreground'>{item.hint}</p>
                </div>
                <div className='rounded-2xl bg-secondary/80 p-3 text-primary'>
                  <Icon className='h-6 w-6' />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className='grid gap-4 lg:grid-cols-[1.5fr_1fr]'>
        <Card className='border-border/60 bg-card/90'>
          <CardHeader className='flex flex-row items-center justify-between gap-4'>
            <div>
              <CardTitle className='text-xl'>คำสั่งซื้อล่าสุด</CardTitle>
              <p className='mt-1 text-sm text-muted-foreground'>
                ใช้ดูสถานะออเดอร์ล่าสุดและยอดที่เกิดขึ้นในระบบ
              </p>
            </div>
            <Link
              href='/admin/orders'
              className='text-sm text-primary transition-colors hover:text-primary/80'
            >
              ดูทั้งหมด
            </Link>
          </CardHeader>
          <CardContent className='space-y-3'>
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order._id}
                  className='flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 sm:flex-row sm:items-center sm:justify-between'
                >
                  <div className='space-y-1'>
                    <p className='font-medium text-foreground'>
                      {order.customerName}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      วันที่สั่งซื้อ {formatDateTime(order.createdAt).dateTime}
                    </p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className='font-semibold text-foreground'>
                      {formatCurrency(order.totalPrice)}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        order.isPaid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.isPaid ? 'ชำระแล้ว' : 'รอชำระ'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className='rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground'>
                ยังไม่มีคำสั่งซื้อในระบบ
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='border-border/60 bg-card/90'>
          <CardHeader>
            <CardTitle className='text-xl'>ทางลัดผู้ดูแล</CardTitle>
            <p className='mt-1 text-sm text-muted-foreground'>
              จุดเริ่มต้นสำหรับติดตามคำสั่งซื้อและตรวจงานหน้าร้าน
            </p>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Link
              href='/admin/orders'
              className='flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 transition-colors hover:bg-muted/70'
            >
              <ShoppingBag className='h-5 w-5 text-primary' />
              <div>
                <p className='font-medium text-foreground'>ดูคำสั่งซื้อ</p>
                <p className='text-sm text-muted-foreground'>
                  ตรวจสอบออเดอร์และการชำระเงิน
                </p>
              </div>
            </Link>
            <Link
              href='/search'
              className='flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 transition-colors hover:bg-muted/70'
            >
              <Package className='h-5 w-5 text-primary' />
              <div>
                <p className='font-medium text-foreground'>ดูสินค้าหน้าร้าน</p>
                <p className='text-sm text-muted-foreground'>
                  เช็กหน้าค้นหาและการแสดงผลสินค้า
                </p>
              </div>
            </Link>
            <Link
              href='/account/manage'
              className='flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 transition-colors hover:bg-muted/70'
            >
              <UserRound className='h-5 w-5 text-primary' />
              <div>
                <p className='font-medium text-foreground'>ตั้งค่าบัญชีผู้ดูแล</p>
                <p className='text-sm text-muted-foreground'>
                  ตรวจข้อมูลผู้ดูแลระบบและความปลอดภัย
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
