'use server'

import { CreateOrderInput } from '@/types'
import { toOrderDTO } from '@/lib/application/orders/serializers'
import type { OrderDTO } from '@/lib/application/orders/dtos'
import { buildOrderItemsFromRequest } from '@/lib/application/orders/build-order-items'
import {
  releaseProductStock,
  reserveProductStock,
} from '@/lib/application/orders/product-stock-reservation'
import {
  approvePayPalPaymentOrder,
  createPayPalPaymentOrder,
} from '@/lib/application/orders/process-paypal-payment'
import { orderItemProductDeps } from '@/lib/infrastructure/orders/order-item-product-deps'
import { productStockReservationDeps } from '@/lib/infrastructure/orders/product-stock-reservation-deps'
import { paypalPaymentDeps } from '@/lib/infrastructure/payments/paypal-payment-deps'
import { calcDeliveryDateAndPrice } from '@/lib/domain/order/pricing'
import { CURRENCY_CODE, formatError } from '../utils'
import { connectToDatabase } from '../db'
import { auth } from '@/auth'
import { OrderInputSchema } from '../validator'
import Order, { IOrder } from '../db/models/order.model'
import { revalidatePath } from 'next/cache'
import { PAGE_SIZE } from '../constants'
import { CreateOrderSchema } from '../order-validator'
import { aggregateStockReservations } from '../order-stock-reservation'
import { normalizePaginationPage } from '../pagination'

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
  const items = await buildOrderItemsFromRequest({
    items: clientOrder.items,
    deps: orderItemProductDeps,
  })
  const stockReservations = aggregateStockReservations(clientOrder.items)
  const cart = {
    ...clientOrder,
    items,
    ...calcDeliveryDateAndPrice({
      items,
      shippingAddress: clientOrder.shippingAddress,
      deliveryDateIndex: clientOrder.deliveryDateIndex,
    }),
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
  const reservedStock = await reserveProductStock({
    reservations: stockReservations,
    deps: productStockReservationDeps,
  })
  try {
    return await Order.create(order)
  } catch (error) {
    await releaseProductStock({
      reservations: reservedStock,
      deps: productStockReservationDeps,
    })
    throw error
  }
}

export async function getOrderById(orderId: string): Promise<OrderDTO | null> {
  await connectToDatabase()
  const order = await Order.findById(orderId)
  return order ? toOrderDTO(order) : null
}

export async function getOrderByIdForCurrentUser(
  orderId: string
): Promise<OrderDTO | null> {
  await connectToDatabase()
  const session = await auth()
  if (!session?.user?.id) return null

  try {
    const order = await findOrderForUser({
      orderId,
      userId: session.user.id,
      isAdmin: session.user.role === 'Admin',
    })
    return toOrderDTO(order)
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
        message: 'คำสั่งซื้อนี้ชำระเงินแล้ว',
      }
    }

    const result = await createPayPalPaymentOrder({
      order,
      deps: paypalPaymentDeps,
    })
    if (result.status === 'already_processed') {
      return {
        success: true,
        message: 'คำสั่งซื้อนี้ชำระเงินแล้ว',
      }
    }

    return {
      success: true,
      message: 'สร้างรายการชำระเงินผ่าน PayPal เรียบร้อยแล้ว',
      data: result.paypalOrderId,
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

    const result = await approvePayPalPaymentOrder({
      order,
      paypalOrderId: data.orderID,
      deps: paypalPaymentDeps,
    })
    if (result.status === 'already_processed') {
      return {
        success: true,
        message: 'คำสั่งซื้อนี้ชำระเงินแล้ว',
      }
    }

    revalidatePath(`/account/orders/${orderId}`)
    return {
      success: true,
      message: 'ชำระเงินผ่าน PayPal สำหรับคำสั่งซื้อนี้เรียบร้อยแล้ว',
    }
  } catch (err) {
    return { success: false, message: formatError(err) }
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
  const currentPage = normalizePaginationPage(page)
  await connectToDatabase()
  const session = await auth()
  if (!session) {
    throw new Error('กรุณาเข้าสู่ระบบก่อนทำรายการ')
  }
  const skipAmount = (currentPage - 1) * limit
  const orders = await Order.find({
    user: session?.user?.id,
  })
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(limit)
  const ordersCount = await Order.countDocuments({ user: session?.user?.id })

  return {
    data: orders.map((order) => toOrderDTO(order)),
    totalPages: Math.ceil(ordersCount / limit),
  }
}

