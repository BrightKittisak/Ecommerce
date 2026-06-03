import { serializeTypedForClient } from '../../serialization'

import type { OrderDTO, OrderPaymentResultDTO, OrderUserDTO } from './dtos'
import type { OrderItem, ShippingAddress } from '@/types'

export type IdLike = {
  toString(): string
}

export type OrderUserRecord =
  | string
  | IdLike
  | {
      _id?: string | IdLike
      name?: string | null
      email?: string | null
    }

export type OrderRecord = {
  _id: string | IdLike
  user: OrderUserRecord
  items: OrderItem[]
  shippingAddress: ShippingAddress
  paymentMethod: string
  paymentResult?: OrderPaymentResultDTO
  itemsPrice: number
  shippingPrice: number
  taxPrice: number
  totalPrice: number
  currencyCode: string
  expectedDeliveryDate: Date
  isDelivered: boolean
  deliveredAt?: Date
  isPaid: boolean
  paidAt?: Date
  createdAt: Date
  updatedAt: Date
}

const toId = (value: string | IdLike) => value.toString()

const toOrderUserDTO = (user: OrderUserRecord): OrderUserDTO => {
  if (typeof user === 'string') return user
  if ('name' in user || 'email' in user) {
    return {
      name: user.name ?? '',
      email: user.email ?? '',
    }
  }

  return toId(user)
}

export const toOrderDTO = (order: OrderRecord): OrderDTO => {
  return serializeTypedForClient({
    _id: toId(order._id),
    user: toOrderUserDTO(order.user),
    items: order.items,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    paymentResult: order.paymentResult,
    itemsPrice: order.itemsPrice,
    shippingPrice: order.shippingPrice,
    taxPrice: order.taxPrice,
    totalPrice: order.totalPrice,
    currencyCode: order.currencyCode,
    expectedDeliveryDate: order.expectedDeliveryDate,
    isDelivered: order.isDelivered,
    deliveredAt: order.deliveredAt,
    isPaid: order.isPaid,
    paidAt: order.paidAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  })
}
