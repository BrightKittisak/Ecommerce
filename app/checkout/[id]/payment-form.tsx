'use client'

import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  approvePayPalOrder,
  createPayPalOrder,
} from '@/lib/actions/order.actions'
import { IOrder } from '@/lib/db/models/order.model'
import {
  formatVariantSummary,
  translatePaymentMethod,
} from '@/lib/i18n'
import { formatDateTime } from '@/lib/utils'

import CheckoutFooter from '../checkout-footer'
import { redirect, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ProductPrice from '@/components/shared/product/product-price'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import StripeForm from './stripe-form'

const paymentMethodLabel: Record<string, string> = {
  'Cash On Delivery': 'เก็บเงินปลายทาง',
  PayPal: 'PayPal',
  Stripe: 'บัตรเครดิต / เดบิต (Stripe)',
}

export default function OrderPaymentForm({
  order,
  paypalClientId,
  clientSecret,
}: {
  order: IOrder
  paypalClientId: string
  isAdmin: boolean
  clientSecret:string | null
}) {
  const router = useRouter()
  const {
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    expectedDeliveryDate,
    isPaid,
  } = order

  if (isPaid) {
    redirect(`/account/orders/${order._id}`)
  }

  function PrintLoadingState() {
    const [{ isPending, isRejected }] = usePayPalScriptReducer()
    let status = ''
    if (isPending) {
      status = 'กำลังโหลด PayPal...'
    } else if (isRejected) {
      status = 'เกิดข้อผิดพลาดในการโหลด PayPal'
    }
    return status
  }

  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order._id)
    if (!res.success)
      return toast.error(res.message)
    return res.data
  }

  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order._id, data)
    if (res.success) {
      toast.success(res.message)
    } else {
      toast.error(res.message) 
    }
  }

  const CheckoutSummary = () => (
    <Card>
      <CardContent className='p-4'>
        <div>
          <div className='text-lg font-bold'>สรุปคำสั่งซื้อ</div>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span>ค่าสินค้า:</span>
              <span>
                <ProductPrice price={itemsPrice} plain />
              </span>
            </div>
            <div className='flex justify-between'>
              <span>ค่าจัดส่ง:</span>
              <span>
                {shippingPrice === undefined ? (
                  '--'
                ) : shippingPrice === 0 ? (
                  'ฟรี'
                ) : (
                  <ProductPrice price={shippingPrice} plain />
                )}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>ภาษี:</span>
              <span>
                {taxPrice === undefined ? (
                  '--'
                ) : (
                  <ProductPrice price={taxPrice} plain />
                )}
              </span>
            </div>
            <div className='flex justify-between pt-1 font-bold text-lg'>
              <span>ยอดรวมสุทธิ:</span>
              <span>
                <ProductPrice price={totalPrice} plain />
              </span>
            </div>

            {!isPaid && paymentMethod === 'PayPal' && (
              <div>
                <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                  <PrintLoadingState />
                  <PayPalButtons
                    createOrder={handleCreatePayPalOrder}
                    onApprove={handleApprovePayPalOrder}
                  />
                </PayPalScriptProvider>
              </div>
            )}

              {!isPaid && paymentMethod === 'Stripe' && clientSecret && (
                <Elements
                  options={{
                    clientSecret,
                  }}
                  stripe={stripePromise}
                >
                  <StripeForm
                    priceInCents={Math.round(order.totalPrice * 100)}
                    orderId={order._id}
                  />
                </Elements>
              )}


            {!isPaid && paymentMethod === 'Cash On Delivery' && (
              <Button
                className='w-full rounded-full'
                onClick={() => router.push(`/account/orders/${order._id}`)}
              >
                ดูคำสั่งซื้อ
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
  )
    
  return (
    <main className='max-w-6xl mx-auto'>
      <div className='grid md:grid-cols-4 gap-6'>
        <div className='md:col-span-3'>
          {/* Shipping Address */}
          <div>
            <div className='grid md:grid-cols-3 my-3 pb-3'>
              <div className='text-lg font-bold'>
                <span>ที่อยู่จัดส่ง</span>
              </div>
              <div className='col-span-2'>
                <p>
                  {shippingAddress.fullName} <br />
                  {shippingAddress.street} <br />
                  {`${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.postalCode}, ${shippingAddress.country}`}
                </p>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className='border-y'>
            <div className='grid md:grid-cols-3 my-3 pb-3'>
              <div className='text-lg font-bold'>
                <span>วิธีชำระเงิน</span>
              </div>
              <div className='col-span-2'>
                <p>
                  {paymentMethodLabel[paymentMethod] ??
                    translatePaymentMethod(paymentMethod)}
                </p>
              </div>
            </div>
          </div>

          <div className='grid md:grid-cols-3 my-3 pb-3'>
            <div className='flex text-lg font-bold'>
              <span>สินค้าและการจัดส่ง</span>
            </div>
            <div className='col-span-2'>
              <p>
                วันที่จัดส่งโดยประมาณ:{' '}
                {formatDateTime(expectedDeliveryDate).dateOnly}
              </p>
              <ul>
                {items.map((item) => (
                  <li key={item.slug}>
                    {item.name} •{' '}
                    {formatVariantSummary({
                      color: item.color,
                      size: item.size,
                    })}{' '}
                    x {item.quantity} = <ProductPrice price={item.price} plain />
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className='block md:hidden'>
            <CheckoutSummary />
          </div>

          <CheckoutFooter />
        </div>
        <div className='hidden md:block'>
          <CheckoutSummary />
        </div>
      </div>
    </main>
  )
}
