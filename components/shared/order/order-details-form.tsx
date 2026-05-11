'use client'

import Image from 'next/image'
import Link from 'next/link'

import ProductPrice from '@/components/shared/product/product-price'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IOrder } from '@/lib/db/models/order.model'
import { formatVariantSummary, translatePaymentMethod } from '@/lib/i18n'
import { cn, formatCurrency, formatDateTime } from '@/lib/utils'

export default function OrderDetailsForm({
  order,
}: {
  order: IOrder
  isAdmin: boolean
}) {
  const {
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
    expectedDeliveryDate,
  } = order

  return (
    <div className='grid md:grid-cols-3 md:gap-5'>
      <div className='space-y-4 overflow-x-auto md:col-span-2'>
        <Card>
          <CardContent className='gap-4 p-4'>
            <h2 className='pb-4 text-xl'>ที่อยู่จัดส่ง</h2>
            <p>
              {shippingAddress.fullName} {shippingAddress.phone}
            </p>
            <p>
              {shippingAddress.street}, {shippingAddress.city},{' '}
              {shippingAddress.province}, {shippingAddress.postalCode},{' '}
              {shippingAddress.country}
            </p>

            {isDelivered ? (
              <Badge>จัดส่งแล้วเมื่อ {formatDateTime(deliveredAt!).dateTime}</Badge>
            ) : (
              <div>
                <Badge variant='destructive'>ยังไม่จัดส่ง</Badge>
                <div>
                  คาดว่าจะจัดส่งถึงในวันที่{' '}
                  {formatDateTime(expectedDeliveryDate!).dateTime}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className='gap-4 p-4'>
            <h2 className='pb-4 text-xl'>วิธีชำระเงิน</h2>
            <p>{translatePaymentMethod(paymentMethod)}</p>
            {isPaid ? (
              <Badge>ชำระแล้วเมื่อ {formatDateTime(paidAt!).dateTime}</Badge>
            ) : (
              <Badge variant='destructive'>ยังไม่ชำระเงิน</Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className='gap-4 p-4'>
            <h2 className='pb-4 text-xl'>รายการสินค้า</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>สินค้า</TableHead>
                  <TableHead>จำนวน</TableHead>
                  <TableHead>ราคา</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className='flex items-center'
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                        />
                        <div className='px-2'>
                          <div>{item.name}</div>
                          <div className='text-xs text-muted-foreground'>
                            {formatVariantSummary({
                              color: item.color,
                              size: item.size,
                            })}
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className='px-2'>{item.quantity}</span>
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatCurrency(item.price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardContent className='space-y-4 gap-4 p-4'>
            <h2 className='pb-4 text-xl'>สรุปคำสั่งซื้อ</h2>
            <div className='flex justify-between'>
              <div>ค่าสินค้า</div>
              <div>
                <ProductPrice price={itemsPrice} plain />
              </div>
            </div>
            <div className='flex justify-between'>
              <div>ภาษี</div>
              <div>
                <ProductPrice price={taxPrice} plain />
              </div>
            </div>
            <div className='flex justify-between'>
              <div>ค่าส่ง</div>
              <div>
                <ProductPrice price={shippingPrice} plain />
              </div>
            </div>
            <div className='flex justify-between'>
              <div>ยอดรวม</div>
              <div>
                <ProductPrice price={totalPrice} plain />
              </div>
            </div>

            {!isPaid && ['Stripe', 'PayPal'].includes(paymentMethod) && (
              <Link
                className={cn(buttonVariants(), 'w-full')}
                href={`/checkout/${order._id}`}
              >
                ชำระเงินสำหรับคำสั่งซื้อนี้
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
