'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import ProductPrice from '@/components/shared/product/product-price'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useCartStore from '@/hooks/use-cart-store'
import useIsMounted from '@/hooks/use-is-mounted'
import { createOrder } from '@/lib/actions/order.actions'
import {
  APP_NAME,
  AVAILABLE_DELIVERY_DATES,
  AVAILABLE_PAYMENT_METHODS,
  DEFAULT_PAYMENT_METHOD,
} from '@/lib/constants'
import {
  formatVariantSummary,
  translatePaymentMethod,
} from '@/lib/i18n'
import {
  calculateFutureDate,
  formatDateTime,
  timeUntilMidnight,
} from '@/lib/utils'
import { ShippingAddressSchema } from '@/lib/validator'
import { ShippingAddress } from '@/types'

import CheckoutFooter from './checkout-footer'

const shippingAddressDefaultValues =
  process.env.NODE_ENV === 'development'
    ? {
        fullName: 'กิตติศักดิ์',
        street: '191/65 ถนนสุขุมวิท',
        city: 'เมืองอุบลราชธานี',
        province: 'อุบลราชธานี',
        phone: '0812345678',
        postalCode: '34000',
        country: 'ประเทศไทย',
      }
    : {
        fullName: '',
        street: '',
        city: '',
        province: '',
        phone: '',
        postalCode: '',
        country: '',
      }

const paymentMethodLabel: Record<string, string> = {
  'Cash On Delivery': 'เก็บเงินปลายทาง',
  PayPal: 'PayPal',
  Stripe: 'บัตรเครดิต / เดบิต (Stripe)',
}

const getPaymentMethodLabel = (method?: string) =>
  method
    ? paymentMethodLabel[method] ?? translatePaymentMethod(method)
    : 'ยังไม่ได้เลือก'

const CheckoutForm = () => {
  const router = useRouter()
  const {
    cart: {
      items,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      shippingAddress,
      deliveryDateIndex,
      paymentMethod = DEFAULT_PAYMENT_METHOD,
    },
    setShippingAddress,
    setPaymentMethod,
    updateItem,
    removeItem,
    setDeliveryDateIndex,
    clearCart,
  } = useCartStore()
  const isMounted = useIsMounted()
  const defaultDeliveryDateIndex = AVAILABLE_DELIVERY_DATES.length - 1
  const selectedDeliveryDateIndex =
    deliveryDateIndex ?? defaultDeliveryDateIndex

  const shippingAddressForm = useForm<ShippingAddress>({
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: shippingAddress || shippingAddressDefaultValues,
  })

  const onSubmitShippingAddress: SubmitHandler<ShippingAddress> = (values) => {
    setShippingAddress(values)
    setIsAddressSelected(true)
    setIsPaymentMethodSelected(false)
    setIsDeliveryDateSelected(false)
  }

  useEffect(() => {
    if (!isMounted || !shippingAddress) return
    shippingAddressForm.reset(shippingAddress)
  }, [isMounted, shippingAddress, shippingAddressForm])

  const [isAddressSelected, setIsAddressSelected] = useState<boolean>(
    Boolean(shippingAddress)
  )
  const [isPaymentMethodSelected, setIsPaymentMethodSelected] =
    useState<boolean>(false)
  const [isDeliveryDateSelected, setIsDeliveryDateSelected] =
    useState<boolean>(false)

  const handlePlaceOrder = async () => {
    if (!shippingAddress) {
      toast.error('กรุณากรอกที่อยู่จัดส่งก่อน')
      return
    }

    const res = await createOrder({
      items,
      shippingAddress,
      expectedDeliveryDate: calculateFutureDate(
        AVAILABLE_DELIVERY_DATES[selectedDeliveryDateIndex].daysToDeliver
      ),
      deliveryDateIndex: selectedDeliveryDateIndex,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    toast.success(res.message)
    clearCart()
    router.push(`/checkout/${res.data?.orderId}`)
  }

  const handleSelectPaymentMethod = () => {
    setIsAddressSelected(true)
    setIsPaymentMethodSelected(true)
    setIsDeliveryDateSelected(false)
  }

  const handleSelectShippingAddress = () => {
    shippingAddressForm.handleSubmit(onSubmitShippingAddress)()
  }

  const CheckoutSummary = () => (
    <Card className='border-border/60 bg-card/90'>
      <CardContent className='p-4'>
        {!isAddressSelected && (
          <div className='mb-4 border-b pb-4'>
            <Button
              className='w-full rounded-full'
              onClick={handleSelectShippingAddress}
            >
              ใช้ที่อยู่นี้
            </Button>
            <p className='py-2 text-center text-xs text-muted-foreground'>
              เลือกที่อยู่จัดส่งและวิธีชำระเงินก่อน เพื่อให้ระบบคำนวณค่าส่งและภาษีได้ถูกต้อง
            </p>
          </div>
        )}
        {isAddressSelected && !isPaymentMethodSelected && (
          <div className='mb-4 border-b pb-4'>
            <Button
              className='w-full rounded-full'
              onClick={handleSelectPaymentMethod}
            >
              ใช้วิธีชำระเงินนี้
            </Button>

            <p className='py-2 text-center text-xs text-muted-foreground'>
              เลือกวิธีชำระเงินเพื่อไปยังขั้นตอนตรวจสอบสินค้าและวันจัดส่ง
            </p>
          </div>
        )}
        {isPaymentMethodSelected && isAddressSelected && (
          <div className='mb-4 border-b pb-4'>
            <Button onClick={handlePlaceOrder} className='w-full rounded-full'>
              ยืนยันคำสั่งซื้อ
            </Button>
            <p className='py-2 text-center text-xs text-muted-foreground'>
              เมื่อกดยืนยันคำสั่งซื้อ คุณยอมรับ
              {' '}
              <Link href='/page/privacy-policy'>นโยบายความเป็นส่วนตัว</Link>
              {' '}และ{' '}
              <Link href='/page/conditions-of-use'>เงื่อนไขการใช้งาน</Link>
              {' '}ของ {APP_NAME}
            </p>
          </div>
        )}

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
            <div className='flex justify-between pt-4 text-lg font-bold'>
              <span>ยอดรวมสุทธิ:</span>
              <span>
                <ProductPrice price={totalPrice} plain />
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <main className='mx-auto max-w-6xl highlight-link'>
      <div className='grid gap-6 md:grid-cols-4'>
        <div className='md:col-span-3'>
          <div>
            {isAddressSelected && shippingAddress ? (
              <div className='my-3 grid grid-cols-1 pb-3 md:grid-cols-12'>
                <div className='col-span-5 flex text-lg font-bold'>
                  <span className='w-8'>1</span>
                  <span>ที่อยู่จัดส่ง</span>
                </div>
                <div className='col-span-5'>
                  <p>
                    {shippingAddress.fullName} <br />
                    {shippingAddress.street} <br />
                    {`${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.postalCode}, ${shippingAddress.country}`}
                  </p>
                </div>
                <div className='col-span-2'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsAddressSelected(false)
                      setIsPaymentMethodSelected(false)
                      setIsDeliveryDateSelected(false)
                    }}
                  >
                    เปลี่ยน
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className='my-2 flex text-lg font-bold text-primary'>
                  <span className='w-8'>1</span>
                  <span>กรอกที่อยู่จัดส่ง</span>
                </div>
                <Form {...shippingAddressForm}>
                  <form
                    method='post'
                    onSubmit={shippingAddressForm.handleSubmit(
                      onSubmitShippingAddress
                    )}
                    className='space-y-4'
                  >
                    <Card className='my-4 border-border/60 bg-card/90 md:ml-8'>
                      <CardContent className='space-y-2 p-4'>
                        <div className='mb-2 text-lg font-bold'>ข้อมูลจัดส่ง</div>

                        <div className='flex flex-col gap-5 md:flex-row'>
                          <FormField
                            control={shippingAddressForm.control}
                            name='fullName'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>ชื่อผู้รับ</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='กรอกชื่อผู้รับ'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div>
                          <FormField
                            control={shippingAddressForm.control}
                            name='street'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>ที่อยู่</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='บ้านเลขที่ / ถนน / แขวง / เขต'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className='flex flex-col gap-5 md:flex-row'>
                          <FormField
                            control={shippingAddressForm.control}
                            name='city'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>อำเภอ / เขต</FormLabel>
                                <FormControl>
                                  <Input placeholder='กรอกอำเภอหรือเขต' {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingAddressForm.control}
                            name='province'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>จังหวัด</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='กรอกจังหวัด'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingAddressForm.control}
                            name='country'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>ประเทศ</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='กรอกประเทศ'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className='flex flex-col gap-5 md:flex-row'>
                          <FormField
                            control={shippingAddressForm.control}
                            name='postalCode'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>รหัสไปรษณีย์</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='กรอกรหัสไปรษณีย์'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingAddressForm.control}
                            name='phone'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>เบอร์โทรศัพท์</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='กรอกเบอร์โทรศัพท์'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className='p-4'>
                        <Button type='submit' className='rounded-full font-bold'>
                          ใช้ที่อยู่นี้
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>
                </Form>
              </>
            )}
          </div>

          <div className='border-y'>
            {isPaymentMethodSelected && paymentMethod ? (
              <div className='my-3 grid grid-cols-1 pb-3 md:grid-cols-12'>
                <div className='col-span-5 flex text-lg font-bold'>
                  <span className='w-8'>2</span>
                  <span>วิธีชำระเงิน</span>
                </div>
                <div className='col-span-5'>
                  <p>{getPaymentMethodLabel(paymentMethod)}</p>
                </div>
                <div className='col-span-2'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsPaymentMethodSelected(false)
                      setIsDeliveryDateSelected(false)
                    }}
                  >
                    เปลี่ยน
                  </Button>
                </div>
              </div>
            ) : isAddressSelected ? (
              <>
                <div className='my-2 flex text-lg font-bold text-primary'>
                  <span className='w-8'>2</span>
                  <span>เลือกวิธีชำระเงิน</span>
                </div>
                <Card className='my-4 border-border/60 bg-card/90 md:ml-8'>
                  <CardContent className='p-4'>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value)}
                    >
                      {AVAILABLE_PAYMENT_METHODS.map((pm) => (
                        <div key={pm.name} className='flex items-center py-1'>
                          <RadioGroupItem
                            value={pm.name}
                            id={`payment-${pm.name}`}
                          />
                          <Label
                            className='cursor-pointer pl-2 font-bold'
                            htmlFor={`payment-${pm.name}`}
                          >
                            {getPaymentMethodLabel(pm.name)}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                  <CardFooter className='p-4'>
                    <Button
                      onClick={handleSelectPaymentMethod}
                      className='rounded-full font-bold'
                    >
                      ใช้วิธีชำระเงินนี้
                    </Button>
                  </CardFooter>
                </Card>
              </>
            ) : (
              <div className='my-4 flex py-3 text-lg font-bold text-muted-foreground'>
                <span className='w-8'>2</span>
                <span>เลือกวิธีชำระเงิน</span>
              </div>
            )}
          </div>

          <div>
            {isDeliveryDateSelected ? (
              <div className='my-3 grid grid-cols-1 pb-3 md:grid-cols-12'>
                <div className='col-span-5 flex text-lg font-bold'>
                  <span className='w-8'>3</span>
                  <span>สินค้าและการจัดส่ง</span>
                </div>
                <div className='col-span-5'>
                  <p>
                    วันที่จัดส่งโดยประมาณ:{' '}
                    {
                      formatDateTime(
                        calculateFutureDate(
                          AVAILABLE_DELIVERY_DATES[selectedDeliveryDateIndex]
                            .daysToDeliver
                        )
                      ).dateOnly
                    }
                  </p>
                  <ul>
                    {items.map((item) => (
                      <li key={item.clientId}>
                        {item.name} x {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className='col-span-2'>
                  <Button
                    variant='outline'
                    onClick={() => setIsDeliveryDateSelected(false)}
                  >
                    เปลี่ยน
                  </Button>
                </div>
              </div>
            ) : isPaymentMethodSelected && isAddressSelected ? (
              <>
                <div className='my-2 flex text-lg font-bold text-primary'>
                  <span className='w-8'>3</span>
                  <span>ตรวจสอบสินค้าและการจัดส่ง</span>
                </div>
                <Card className='border-border/60 bg-card/90 md:ml-8'>
                  <CardContent className='p-4'>
                    <p className='mb-2'>
                      <span className='text-lg font-bold text-green-700'>
                        จะได้รับภายใน{' '}
                        {
                          formatDateTime(
                            calculateFutureDate(
                              AVAILABLE_DELIVERY_DATES[selectedDeliveryDateIndex]
                                .daysToDeliver
                            )
                          ).dateOnly
                        }
                      </span>{' '}
                      หากคุณสั่งซื้อภายใน {timeUntilMidnight().hours} ชั่วโมง{' '}
                      {timeUntilMidnight().minutes} นาที
                    </p>
                    <div className='grid gap-6 md:grid-cols-2'>
                      <div>
                        {items.map((item) => (
                          <div key={item.clientId} className='flex gap-4 py-2'>
                            <div className='relative h-16 w-16'>
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes='20vw'
                                style={{
                                  objectFit: 'contain',
                                }}
                              />
                            </div>

                            <div className='flex-1'>
                              <p className='font-semibold'>{item.name}</p>
                              <p className='text-sm text-muted-foreground'>
                                {formatVariantSummary({
                                  color: item.color,
                                  size: item.size,
                                })}
                              </p>
                              <p className='font-bold'>
                                <ProductPrice price={item.price} plain />
                              </p>

                              <Select
                                value={item.quantity.toString()}
                                onValueChange={(value) => {
                                  if (value === '0') removeItem(item)
                                  else updateItem(item, Number(value))
                                }}
                              >
                                <SelectTrigger className='w-24'>
                                  <SelectValue>
                                    จำนวน: {item.quantity}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent position='popper'>
                                  {Array.from({
                                    length: item.countInStock,
                                  }).map((_, i) => (
                                    <SelectItem key={i + 1} value={`${i + 1}`}>
                                      {i + 1}
                                    </SelectItem>
                                  ))}
                                  <SelectItem key='delete' value='0'>
                                    ลบ
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className='font-bold'>
                          <p className='mb-2'>เลือกความเร็วในการจัดส่ง:</p>

                          <ul>
                            <RadioGroup
                              value={
                                AVAILABLE_DELIVERY_DATES[selectedDeliveryDateIndex]
                                  .name
                              }
                              onValueChange={(value) =>
                                setDeliveryDateIndex(
                                  AVAILABLE_DELIVERY_DATES.findIndex(
                                    (delivery) => delivery.name === value
                                  )
                                )
                              }
                            >
                              {AVAILABLE_DELIVERY_DATES.map((dd) => (
                                <div key={dd.name} className='flex'>
                                  <RadioGroupItem
                                    value={dd.name}
                                    id={`address-${dd.name}`}
                                  />
                                  <Label
                                    className='cursor-pointer space-y-2 pl-2'
                                    htmlFor={`address-${dd.name}`}
                                  >
                                    <div className='font-semibold text-green-700'>
                                      {
                                        formatDateTime(
                                          calculateFutureDate(dd.daysToDeliver)
                                        ).dateOnly
                                      }
                                    </div>
                                    <div>
                                      {(dd.freeShippingMinPrice > 0 &&
                                      itemsPrice >= dd.freeShippingMinPrice
                                        ? 0
                                        : dd.shippingPrice) === 0 ? (
                                        'จัดส่งฟรี'
                                      ) : (
                                        <ProductPrice
                                          price={dd.shippingPrice}
                                          plain
                                        />
                                      )}
                                    </div>
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className='justify-end p-4'>
                    <Button
                      onClick={() => setIsDeliveryDateSelected(true)}
                      className='rounded-full'
                    >
                      ยืนยันสินค้าและการจัดส่ง
                    </Button>
                  </CardFooter>
                </Card>
              </>
            ) : (
              <div className='my-4 flex py-3 text-lg font-bold text-muted-foreground'>
                <span className='w-8'>3</span>
                <span>สินค้าและการจัดส่ง</span>
              </div>
            )}
          </div>

          {isPaymentMethodSelected && isAddressSelected && (
            <div className='mt-6'>
              <div className='block md:hidden'>
                <CheckoutSummary />
              </div>

              <Card className='hidden border-border/60 bg-card/90 md:block'>
                <CardContent className='flex flex-col items-center justify-between gap-3 p-4 md:flex-row'>
                  <Button onClick={handlePlaceOrder} className='rounded-full'>
                    ยืนยันคำสั่งซื้อ
                  </Button>
                  <div className='flex-1'>
                    <p className='text-lg font-bold'>
                      ยอดรวมสุทธิ: <ProductPrice price={totalPrice} plain />
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      เมื่อกดยืนยันคำสั่งซื้อ คุณยอมรับ
                      {' '}
                      <Link href='/page/privacy-policy'>นโยบายความเป็นส่วนตัว</Link>
                      {' '}และ{' '}
                      <Link href='/page/conditions-of-use'>
                        เงื่อนไขการใช้งาน
                      </Link>
                      {' '}ของ {APP_NAME}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <CheckoutFooter />
        </div>
        <div className='hidden md:block'>
          <CheckoutSummary />
        </div>
      </div>
    </main>
  )
}

export default CheckoutForm
