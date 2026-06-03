'use server'

import { PAGE_SIZE } from '@/lib/constants'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import {
  AdminOrderListItem,
  toAdminOrderListItem,
} from '@/lib/application/admin/admin-orders'
import { normalizePaginationPage } from '@/lib/pagination'

export type AdminOrdersResult = {
  orders: AdminOrderListItem[]
  page: number
  totalPages: number
  totalOrders: number
}

export async function getAdminOrders({
  page,
  limit = PAGE_SIZE,
}: {
  page?: unknown
  limit?: number
}): Promise<AdminOrdersResult> {
  const currentPage = normalizePaginationPage(page)
  const skipAmount = (currentPage - 1) * limit

  await connectToDatabase()

  const [ordersRaw, ordersCount] = await Promise.all([
    Order.find({})
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(limit)
      .populate('user', 'name email')
      .lean(),
    Order.countDocuments(),
  ])

  return {
    orders: ordersRaw.map(toAdminOrderListItem),
    page: currentPage,
    totalPages: Math.ceil(ordersCount / limit),
    totalOrders: ordersCount,
  }
}
