import { PAGE_SIZE } from '../../constants'
import { normalizePaginationPage } from '../../pagination'

import type { OrderDTO } from './dtos'
import { toOrderDTO } from './serializers'

export type UserOrderListRecord = Parameters<typeof toOrderDTO>[0]

export type UserOrderListResult = {
  data: OrderDTO[]
  totalPages: number
}

export type UserOrderListQueryDeps = {
  findOrdersForUser(input: {
    userId: string
    skip: number
    limit: number
  }): Promise<UserOrderListRecord[]>
  countOrdersForUser(userId: string): Promise<number>
}

export async function getUserOrderList({
  userId,
  limit,
  page,
  deps,
}: {
  userId: string
  limit?: number
  page: number
  deps: UserOrderListQueryDeps
}): Promise<UserOrderListResult> {
  const pageSize = limit || PAGE_SIZE
  const currentPage = normalizePaginationPage(page)
  const skip = (currentPage - 1) * pageSize
  const [orders, ordersCount] = await Promise.all([
    deps.findOrdersForUser({
      userId,
      skip,
      limit: pageSize,
    }),
    deps.countOrdersForUser(userId),
  ])

  return {
    data: orders.map((order) => toOrderDTO(order)),
    totalPages: Math.ceil(ordersCount / pageSize),
  }
}
