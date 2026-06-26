'use server'

import { CreateOrderInput } from '@/types'
import type { OrderDTO } from '@/lib/application/orders/dtos'
import { createOrderFromCart } from '@/lib/application/orders/create-order-from-cart'
import {
  getOrderDTOById,
  getOrderDTOForUser,
  requireOrderForUser,
} from '@/lib/application/orders/order-access-query'
import { getUserOrderList } from '@/lib/application/orders/user-order-list-query'
import {
  approvePayPalPaymentOrder,
  createPayPalPaymentOrder,
} from '@/lib/application/orders/process-paypal-payment'
import { orderAccessQueryDeps } from '@/lib/infrastructure/orders/order-access-query-deps'
import { createOrderFromCartDeps } from '@/lib/infrastructure/orders/create-order-from-cart-deps'
import { userOrderListQueryDeps } from '@/lib/infrastructure/orders/user-order-list-query-deps'
import { paypalPaymentDeps } from '@/lib/infrastructure/payments/paypal-payment-deps'
import { getOrderActionErrorMessage } from '@/lib/order-action-errors'
import { getPayPalActionErrorMessage } from '@/lib/paypal-action-errors'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { CreateOrderSchema } from '../domain/order/create-order.schema'

// CREATE
export const createOrder = async (clientOrder: CreateOrderInput) => {
  try {
    const session = await auth()
    if (!session) throw new Error('กรุณาเข้าสู่ระบบก่อนทำรายการ')
    // recalculate price and delivery date on the server
    const createdOrder = await createOrderFromCart(
      {
        clientOrder: CreateOrderSchema.parse(clientOrder),
        userId: session.user.id!,
        deps: createOrderFromCartDeps,
      }
    )
    return {
      success: true,
      message: 'สร้างคำสั่งซื้อเรียบร้อยแล้ว',
      data: { orderId: createdOrder._id.toString() },
    }
  } catch (error) {
    return { success: false, message: getOrderActionErrorMessage(error) }
  }
}

export async function getOrderById(orderId: string): Promise<OrderDTO | null> {
  return getOrderDTOById({
    orderId,
    deps: orderAccessQueryDeps,
  })
}

export async function getOrderByIdForCurrentUser(
  orderId: string
): Promise<OrderDTO | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  try {
    return getOrderDTOForUser({
      orderId,
      userId: session.user.id,
      isAdmin: session.user.role === 'Admin',
      deps: orderAccessQueryDeps,
    })
  } catch {
    return null
  }
}

export async function createPayPalOrder(orderId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new Error('กรุณาเข้าสู่ระบบก่อนทำรายการ')

    const order = await requireOrderForUser({
      orderId,
      userId: session.user.id,
      isAdmin: session.user.role === 'Admin',
      deps: orderAccessQueryDeps,
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
    return { success: false, message: getPayPalActionErrorMessage(err) }
  }
}

export async function approvePayPalOrder(
  orderId: string,
  data: { orderID: string }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new Error('กรุณาเข้าสู่ระบบก่อนทำรายการ')

    const order = await requireOrderForUser({
      orderId,
      userId: session.user.id,
      isAdmin: session.user.role === 'Admin',
      deps: orderAccessQueryDeps,
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
    return { success: false, message: getPayPalActionErrorMessage(err) }
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
  const session = await auth()
  if (!session) {
    throw new Error('กรุณาเข้าสู่ระบบก่อนทำรายการ')
  }
  return getUserOrderList({
    userId: session.user.id!,
    limit,
    page,
    deps: userOrderListQueryDeps,
  })
}

