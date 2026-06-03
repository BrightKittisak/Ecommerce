'use server'

import { PAGE_SIZE } from '@/lib/constants'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import Product from '@/lib/db/models/product.model'
import User from '@/lib/db/models/user.model'
import {
  AdminOverviewOrderRecord,
  AdminOverviewRecentOrder,
  toAdminOverviewRecentOrder,
} from '@/lib/application/admin/admin-overview'
import {
  AdminOrdersResult,
  getAdminOrderList,
} from '@/lib/application/admin/admin-orders'
import { adminOrderListQueryDeps } from '@/lib/infrastructure/admin/admin-order-list-query-deps'
import { normalizePaginationPage } from '@/lib/pagination'

type SalesAggregationRow = {
  totalRevenue?: number
}

export type AdminOverviewStats = {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  paidOrders: number
  lowStockProducts: number
  totalRevenue: number
  recentOrders: AdminOverviewRecentOrder[]
}

export async function getAdminOrders({
  page,
  limit = PAGE_SIZE,
}: {
  page?: unknown
  limit?: number
}): Promise<AdminOrdersResult> {
  const currentPage = normalizePaginationPage(page)

  await connectToDatabase()

  return getAdminOrderList({
    page: currentPage,
    limit,
    deps: adminOrderListQueryDeps,
  })
}

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  await connectToDatabase()

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    paidOrders,
    lowStockProducts,
    salesAgg,
    recentOrdersRaw,
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ isPaid: true }),
    Product.countDocuments({ countInStock: { $lte: 5 } }),
    Order.aggregate<SalesAggregationRow>([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
    ]),
    Order.find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('user', 'name')
      .lean<AdminOverviewOrderRecord[]>(),
  ])

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    paidOrders,
    lowStockProducts,
    totalRevenue: salesAgg[0]?.totalRevenue ?? 0,
    recentOrders: recentOrdersRaw.map(toAdminOverviewRecentOrder),
  }
}
