'use server'

import { PAGE_SIZE } from '@/lib/constants'
import { connectToDatabase } from '@/lib/db'
import {
  AdminOverviewStats,
  getAdminOverview,
} from '@/lib/application/admin/admin-overview'
import {
  AdminOrdersResult,
  getAdminOrderList,
} from '@/lib/application/admin/admin-orders'
import { adminOverviewQueryDeps } from '@/lib/infrastructure/admin/admin-overview-query-deps'
import { adminOrderListQueryDeps } from '@/lib/infrastructure/admin/admin-order-list-query-deps'
import { normalizePaginationPage } from '@/lib/pagination'

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

  return getAdminOverview({
    recentOrderLimit: 6,
    deps: adminOverviewQueryDeps,
  })
}
