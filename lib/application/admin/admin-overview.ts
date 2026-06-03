export type AdminOverviewRecentOrder = {
  _id: string
  createdAt: string
  totalPrice: number
  isPaid: boolean
  customerName: string
}

type IdLike = {
  toString(): string
}

type AdminOverviewOrderUserRecord =
  | string
  | IdLike
  | {
      name?: string | null
    }
  | null
  | undefined

export type AdminOverviewOrderRecord = {
  _id: string | IdLike
  createdAt: Date | string
  totalPrice: number
  isPaid: boolean
  user?: AdminOverviewOrderUserRecord
}

const UNKNOWN_CUSTOMER_NAME = 'ลูกค้าที่ไม่ได้ระบุชื่อ'

const toIsoString = (date: Date | string) =>
  date instanceof Date ? date.toISOString() : date

const getCustomerName = (user: AdminOverviewOrderUserRecord) => {
  if (user && typeof user === 'object' && 'name' in user) {
    return user.name || UNKNOWN_CUSTOMER_NAME
  }

  return UNKNOWN_CUSTOMER_NAME
}

export function toAdminOverviewRecentOrder(
  order: AdminOverviewOrderRecord
): AdminOverviewRecentOrder {
  return {
    _id: order._id.toString(),
    createdAt: toIsoString(order.createdAt),
    totalPrice: order.totalPrice,
    isPaid: order.isPaid,
    customerName: getCustomerName(order.user),
  }
}
