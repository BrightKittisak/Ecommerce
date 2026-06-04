import type {
  AdminOverviewOrderRecord,
  AdminOverviewQueryDeps,
} from '@/lib/application/admin/admin-overview'
import Order from '@/lib/db/models/order.model'
import Product from '@/lib/db/models/product.model'
import User from '@/lib/db/models/user.model'

type SalesAggregationRow = {
  totalRevenue?: number
}

export const adminOverviewQueryDeps: AdminOverviewQueryDeps = {
  countUsers() {
    return User.countDocuments()
  },
  countProducts() {
    return Product.countDocuments()
  },
  countOrders() {
    return Order.countDocuments()
  },
  countPaidOrders() {
    return Order.countDocuments({ isPaid: true })
  },
  countLowStockProducts() {
    return Product.countDocuments({ countInStock: { $lte: 5 } })
  },
  async sumPaidOrderRevenue() {
    const salesAgg = await Order.aggregate<SalesAggregationRow>([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
    ])

    return salesAgg[0]?.totalRevenue ?? 0
  },
  findRecentOrders(limit) {
    return Order.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name')
      .lean<AdminOverviewOrderRecord[]>()
  },
}
