'use server'

import { Cart, OrderItem, ShippingAddress } from '@/types'
import { calculateFutureDate, formatError, round2 } from '../utils'
import { connectToDatabase } from '../db'
import { auth } from '@/auth'
import { OrderInputSchema } from '../validator'
import Order, { IOrder } from '../db/models/order.model'
import { paypal } from '../paypal'
import { sendPurchaseReceipt } from '@/emails'
import { revalidatePath } from 'next/cache'
import { AVAILABLE_DELIVERY_DATES, PAGE_SIZE } from '../constants'

const getOrderOwnerId = (order: IOrder) => {
  if (typeof order.user === 'string') return order.user
  if (order.user && typeof order.user === 'object' && '_id' in order.user) {
    return String(order.user._id)
  }
  return String(order.user)
}

const findOrderForUser = async ({
  orderId,
  userId,
  isAdmin,
}: {
  orderId: string
  userId: string
  isAdmin: boolean
}) => {
  const order = await Order.findById(orderId)
  if (!order) throw new Error('ไม่พบคำสั่งซื้อ')
  if (!isAdmin && getOrderOwnerId(order) !== userId) {
    throw new Error('ไม่พบคำสั่งซื้อ')
  }
  return order
}

// CREATE
export const createOrder = async (clientSideCart: Cart) => {
  try {
    await connectToDatabase()
    const session = await auth()
    if (!session) throw new Error('กรุณาเข้าสู่ระบบก่อนทำรายการ')
    // recalculate price and delivery date on the server
    const createdOrder = await createOrderFromCart(
      clientSideCart,
      session.user.id!
    )
    return {
      success: true,
      message: 'สร้างคำสั่งซื้อเรียบร้อยแล้ว',
      data: { orderId: createdOrder._id.toString() },
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
export const createOrderFromCart = async (
  clientSideCart: Cart,
  userId: string
) => {
  const cart = {
    ...clientSideCart,
    ...(await calcDeliveryDateAndPrice({
      items: clientSideCart.items,
      shippingAddress: clientSideCart.shippingAddress,
      deliveryDateIndex: clientSideCart.deliveryDateIndex,
    })),
  }

  const order = OrderInputSchema.parse({
    user: userId,
    items: cart.items,
    shippingAddress: cart.shippingAddress,
    paymentMethod: cart.paymentMethod,
    itemsPrice: cart.itemsPrice,
    shippingPrice: cart.shippingPrice,
    taxPrice: cart.taxPrice,
    totalPrice: cart.totalPrice,
    expectedDeliveryDate: cart.expectedDeliveryDate,
  })
  return await Order.create(order)
}

export async function getOrderById(orderId: string): Promise<IOrder> {
  await connectToDatabase()
  const order = await Order.findById(orderId)
  return JSON.parse(JSON.stringify(order))
}

export async function getOrderByIdForCurrentUser(
  orderId: string
): Promise<IOrder | null> {
  await connectToDatabase()
  const session = await auth()
  if (!session?.user?.id) return null

  try {
    const order = await findOrderForUser({
      orderId,
      userId: session.user.id,
      isAdmin: session.user.role === 'Admin',
    })
    return JSON.parse(JSON.stringify(order))
  } catch {
    return null
  }
}

export async function createPayPalOrder(orderId: string) {
  await connectToDatabase()
  try {
    const session = await auth()
    if (!session?.user?.id) throw new Error('กรุณาเข้าสู่ระบบก่อนทำรายการ')

    const order = await findOrderForUser({
      orderId,
      userId: session.user.id,
      isAdmin: session.user.role === 'Admin',
    })

    const paypalOrder = await paypal.createOrder(order.totalPrice)
    order.paymentResult = {
      id: paypalOrder.id,
      email_address: '',
      status: '',
      pricePaid: '0',
    }
    await order.save()
    return {
      success: true,
      message: 'สร้างรายการชำระเงินผ่าน PayPal เรียบร้อยแล้ว',
      data: paypalOrder.id,
    }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}

export async function approvePayPalOrder(
  orderId: string,
  data: { orderID: string }
) {
  await connectToDatabase()
  try {
    const session = await auth()
    if (!session?.user?.id) throw new Error('กรุณาเข้าสู่ระบบก่อนทำรายการ')

    const order = await findOrderForUser({
      orderId,
      userId: session.user.id,
      isAdmin: session.user.role === 'Admin',
    })

    const captureData = await paypal.capturePayment(data.orderID)
    if (
      !captureData ||
      captureData.id !== order.paymentResult?.id ||
      captureData.status !== 'COMPLETED'
    )
      throw new Error('เกิดข้อผิดพลาดในการชำระเงินผ่าน PayPal')
    order.isPaid = true
    order.paidAt = new Date()
    order.paymentResult = {
      id: captureData.id,
      status: captureData.status,
      email_address: captureData.payer.email_address,
      pricePaid:
        captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
    }
    await order.populate('user', 'email')
    await order.save()
    await sendPurchaseReceipt({ order })
    revalidatePath(`/account/orders/${orderId}`)
    return {
      success: true,
      message: 'ชำระเงินผ่าน PayPal สำหรับคำสั่งซื้อนี้เรียบร้อยแล้ว',
    }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}

export const calcDeliveryDateAndPrice = async ({
  items,
  shippingAddress,
  deliveryDateIndex,
}: {
  deliveryDateIndex?: number
  items: OrderItem[]
  shippingAddress?: ShippingAddress
}) => {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  )

  const deliveryDate =
    AVAILABLE_DELIVERY_DATES[
    deliveryDateIndex === undefined
      ? AVAILABLE_DELIVERY_DATES.length - 1
      : deliveryDateIndex
    ]
  const shippingPrice =
    !shippingAddress || !deliveryDate
      ? undefined
      : deliveryDate.freeShippingMinPrice > 0 &&
        itemsPrice >= deliveryDate.freeShippingMinPrice
        ? 0
        : deliveryDate.shippingPrice

  const taxPrice = !shippingAddress ? undefined : round2(itemsPrice * 0.15)

  const totalPrice = round2(
    itemsPrice +
    (shippingPrice ? round2(shippingPrice) : 0) +
    (taxPrice ? round2(taxPrice) : 0)
  )
  return {
    AVAILABLE_DELIVERY_DATES,
    deliveryDateIndex:
      deliveryDateIndex === undefined
        ? AVAILABLE_DELIVERY_DATES.length - 1
        : deliveryDateIndex,
    expectedDeliveryDate: calculateFutureDate(deliveryDate.daysToDeliver),
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice
  }
}


// GET
export async function getMyOrders({
  limit,
  page,
}: {
  limit?: number
  page: number
}) {
  limit = limit || PAGE_SIZE
  await connectToDatabase()
  const session = await auth()
  if (!session) {
    throw new Error('กรุณาเข้าสู่ระบบก่อนทำรายการ')
  }
  const skipAmount = (Number(page) - 1) * limit
  const orders = await Order.find({
    user: session?.user?.id,
  })
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(limit)
  const ordersCount = await Order.countDocuments({ user: session?.user?.id })

  return {
    data: JSON.parse(JSON.stringify(orders)),
    totalPages: Math.ceil(ordersCount / limit),
  }
}

