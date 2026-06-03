export type AdminOrderListItem = {
  _id: string
  createdAt: string
  paidAt?: string
  deliveredAt?: string
  isPaid: boolean
  isDelivered: boolean
  totalPrice: number
  customerName: string
}

type IdLike = {
  toString(): string
}

type AdminOrderUserRecord =
  | string
  | IdLike
  | {
      name?: string | null
    }
  | null
  | undefined

export type AdminOrderRecord = {
  _id: string | IdLike
  createdAt: Date | string
  paidAt?: Date | string
  deliveredAt?: Date | string
  isPaid: boolean
  isDelivered: boolean
  totalPrice: number
  user?: AdminOrderUserRecord
}

const UNKNOWN_CUSTOMER_NAME = 'ลูกค้าที่ไม่ได้ระบุชื่อ'

const toIsoString = (date: Date | string) =>
  date instanceof Date ? date.toISOString() : date

const toOptionalIsoString = (date?: Date | string) =>
  date ? toIsoString(date) : undefined

const getCustomerName = (user: AdminOrderUserRecord) => {
  if (user && typeof user === 'object' && 'name' in user) {
    return user.name || UNKNOWN_CUSTOMER_NAME
  }

  return UNKNOWN_CUSTOMER_NAME
}

export function toAdminOrderListItem(
  order: AdminOrderRecord
): AdminOrderListItem {
  return {
    _id: order._id.toString(),
    createdAt: toIsoString(order.createdAt),
    paidAt: toOptionalIsoString(order.paidAt),
    deliveredAt: toOptionalIsoString(order.deliveredAt),
    isPaid: order.isPaid,
    isDelivered: order.isDelivered,
    totalPrice: order.totalPrice,
    customerName: getCustomerName(order.user),
  }
}
