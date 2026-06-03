import type { OrderDTO } from './dtos'
import type { PayPalPaymentOrder } from './process-paypal-payment'
import { type IdLike, type OrderRecord, toOrderDTO } from './serializers'

export type OrderAccessRecord = OrderRecord & PayPalPaymentOrder

export type OrderAccessQueryDeps = {
  findOrderById(orderId: string): Promise<OrderAccessRecord | null>
}

const ORDER_NOT_FOUND_MESSAGE = 'ไม่พบคำสั่งซื้อ'

function hasId(value: unknown): value is { _id: string | IdLike } {
  return Boolean(value && typeof value === 'object' && '_id' in value)
}

export function getOrderOwnerId(order: { user: unknown }) {
  if (typeof order.user === 'string') return order.user
  if (hasId(order.user)) return String(order.user._id)

  return String(order.user)
}

export async function requireOrderForUser({
  orderId,
  userId,
  isAdmin,
  deps,
}: {
  orderId: string
  userId: string
  isAdmin: boolean
  deps: OrderAccessQueryDeps
}): Promise<OrderAccessRecord> {
  const order = await deps.findOrderById(orderId)
  if (!order) throw new Error(ORDER_NOT_FOUND_MESSAGE)
  if (!isAdmin && getOrderOwnerId(order) !== userId) {
    throw new Error(ORDER_NOT_FOUND_MESSAGE)
  }

  return order
}

export async function getOrderDTOById({
  orderId,
  deps,
}: {
  orderId: string
  deps: OrderAccessQueryDeps
}): Promise<OrderDTO | null> {
  const order = await deps.findOrderById(orderId)
  return order ? toOrderDTO(order) : null
}

export async function getOrderDTOForUser({
  orderId,
  userId,
  isAdmin,
  deps,
}: {
  orderId: string
  userId: string
  isAdmin: boolean
  deps: OrderAccessQueryDeps
}): Promise<OrderDTO | null> {
  try {
    const order = await requireOrderForUser({
      orderId,
      userId,
      isAdmin,
      deps,
    })
    return toOrderDTO(order)
  } catch {
    return null
  }
}
