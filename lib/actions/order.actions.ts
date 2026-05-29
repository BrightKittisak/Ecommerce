'use server'

import { CreateOrderInput, OrderItem, ShippingAddress } from '@/types'
import { CURRENCY_CODE, calculateFutureDate, formatError, round2 } from '../utils'
import { connectToDatabase } from '../db'
import { auth } from '@/auth'
import { OrderInputSchema } from '../validator'
import Order, { IOrder } from '../db/models/order.model'
import Product from '../db/models/product.model'
import { paypal } from '../paypal'
import { sendPurchaseReceipt } from '@/emails'
import { revalidatePath } from 'next/cache'
import { AVAILABLE_DELIVERY_DATES, PAGE_SIZE } from '../constants'
import { CreateOrderSchema } from '../order-validator'

const getOrderOwnerId = (order: IOrder) => {
  if (typeof order.user === 'string') return order.user
  if (order.user && typeof order.user === 'object' && '_id' in order.user) {
    return String(order.user._id)
  }
  return String(order.user)
}

const formatPaymentAmount = (amount: number) => round2(amount).toFixed(2)

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

const buildOrderItemsFromRequest = async (
  items: CreateOrderInput['items']
): Promise<OrderItem[]> => {
  const productIds = [...new Set(items.map((item) => item.product))]
  const products = await Product.find({
    _id: { $in: productIds },
    isPublished: true,
  }).lean()

  const productById = new Map(
    products.map((product) => [String(product._id), product])
  )

  return items.map((item) => {
    const product = productById.get(item.product)

    if (!product) {
      throw new Error('ไม่พบสินค้าที่ต้องการสั่งซื้อ')
    }

    if (item.quantity > product.countInStock) {
      throw new Error(`สินค้า ${product.name} มีในสต็อกไม่เพียงพอ`)
    }

    if (item.size && product.sizes.length > 0 && !product.sizes.includes(item.size)) {
      throw new Error(`ไซซ์ ${item.size} ของสินค้า ${product.name} ไม่ถูกต้อง`)
    }

    if (
      item.color &&
      product.colors.length > 0 &&
      !product.colors.includes(item.color)
    ) {
      throw new Error(`สี ${item.color} ของสินค้า ${product.name} ไม่ถูกต้อง`)
    }

    const primaryImage = product.images[0]
    if (!primaryImage) {
      throw new Error(`สินค้า ${product.name} ไม่มีรูปภาพสำหรับสร้างคำสั่งซื้อ`)
    }

    return {
      clientId: item.clientId,
      product: String(product._id),
      name: product.name,
      slug: product.slug,
      category: product.category,
      quantity: item.quantity,
      countInStock: product.countInStock,
      image: primaryImage,
      price: round2(product.price),
      size: item.size,
      color: item.color,
    }
  })
}

// CREATE
export const createOrder = async (clientOrder: CreateOrderInput) => {
  try {
    await connectToDatabase()
    const session = await auth()
    if (!session) throw new Error('กรุณาเข้าสู่ระบบก่อนทำรายการ')
    // recalculate price and delivery date on the server
    const createdOrder = await createOrderFromCart(
      CreateOrderSchema.parse(clientOrder),
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
  clientOrder: CreateOrderInput,
  userId: string
) => {
  const items = await buildOrderItemsFromRequest(clientOrder.items)
  const cart = {
    ...clientOrder,
    items,
    ...(await calcDeliveryDateAndPrice({
      items,
      shippingAddress: clientOrder.shippingAddress,
      deliveryDateIndex: clientOrder.deliveryDateIndex,
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
    currencyCode: CURRENCY_CODE,
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

    if (order.isPaid) {
      return {
        success: true,
        message: 'Order is already paid',
      }
    }

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

    if (order.isPaid) {
      return {
        success: true,
        message: 'Order is already paid',
      }
    }

    if (data.orderID !== order.paymentResult?.id) {
      throw new Error('PayPal order does not match this order')
    }

    const captureData = await paypal.capturePayment(data.orderID)
    const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0]
    const capturedAmount = capture?.amount
    const expectedAmount = formatPaymentAmount(order.totalPrice)
    if (
      !captureData ||
      captureData.id !== data.orderID ||
      captureData.status !== 'COMPLETED' ||
      capture?.status !== 'COMPLETED' ||
      capturedAmount?.currency_code !== CURRENCY_CODE ||
      capturedAmount?.value !== expectedAmount
    )
      throw new Error('เกิดข้อผิดพลาดในการชำระเงินผ่าน PayPal')
    order.isPaid = true
    order.paidAt = new Date()
    order.paymentResult = {
      id: capture.id || captureData.id,
      status: capture.status,
      email_address: captureData.payer?.email_address || '',
      pricePaid: capturedAmount.value,
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

  const fallbackDeliveryDateIndex = AVAILABLE_DELIVERY_DATES.length - 1
  const normalizedDeliveryDateIndex =
    typeof deliveryDateIndex === 'number' &&
    Number.isInteger(deliveryDateIndex) &&
    deliveryDateIndex >= 0 &&
    deliveryDateIndex < AVAILABLE_DELIVERY_DATES.length
      ? deliveryDateIndex
      : fallbackDeliveryDateIndex

  const deliveryDate = AVAILABLE_DELIVERY_DATES[normalizedDeliveryDateIndex]
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
    deliveryDateIndex: normalizedDeliveryDateIndex,
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

