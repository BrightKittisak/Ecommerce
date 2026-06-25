import type {
  AdminOverviewOrderRecord,
  AdminOverviewQueryDeps,
} from '@/lib/application/admin/admin-overview'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import Product from '@/lib/db/models/product.model'
import User from '@/lib/db/models/user.model'

type SalesAggregationRow = {
  totalRevenue?: number
}

export const adminOverviewQueryDeps: AdminOverviewQueryDeps = {
  async countUsers() {
    await connectToDatabase()
    return User.countDocuments()
  },
  async countProducts() {
    await connectToDatabase()
    return Product.countDocuments()
  },
  async countOrders() {
    await connectToDatabase()
    return Order.countDocuments()
  },
  async countPaidOrders() {
    await connectToDatabase()
    return Order.countDocuments({ isPaid: true })
  },
  async countLowStockProducts() {
    await connectToDatabase()
    return Product.countDocuments({ countInStock: { $lte: 5 } })
  },
  async sumPaidOrderRevenue() {
    await connectToDatabase()
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
  async findRecentOrders(limit) {
    await connectToDatabase()
    return Order.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name')
      .lean<AdminOverviewOrderRecord[]>()
  },
}
