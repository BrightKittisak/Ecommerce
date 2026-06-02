import type { OrderItem, ShippingAddress } from '@/types'

export type OrderUserDTO =
  | string
  | {
      name: string
      email: string
    }

export type OrderPaymentResultDTO = {
  id: string
  status: string
  email_address: string
  pricePaid: string
}

export type OrderDTO = {
  _id: string
  user: OrderUserDTO
  items: OrderItem[]
  shippingAddress: ShippingAddress
  paymentMethod: string
  paymentResult?: OrderPaymentResultDTO
  itemsPrice: number
  shippingPrice: number
  taxPrice: number
  totalPrice: number
  currencyCode: string
  expectedDeliveryDate: string
  isDelivered: boolean
  deliveredAt?: string
  isPaid: boolean
  paidAt?: string
  createdAt: string
  updatedAt: string
}
