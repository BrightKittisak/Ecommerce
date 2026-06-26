import type {
  RouteRateLimitPersistenceDeps,
  RouteRateLimitPolicy,
  RouteRateLimitRecord,
} from '../../route-rate-limit'
import { connectToDatabase } from '../../db'
import RouteRateLimit from '../../db/models/route-rate-limit.model'

export const routeRateLimitDeps: RouteRateLimitPersistenceDeps = {
  async updateRouteRateLimitRecord({
    expiresAt,
    key,
    now,
    policy,
    windowStartedAfter,
  }: {
    expiresAt: Date
    key: string
    now: Date
    policy: RouteRateLimitPolicy
    windowStartedAfter: Date
  }) {
    await connectToDatabase()

    return RouteRateLimit.findOneAndUpdate(
      { key },
      [
        {
          $set: {
            key,
            route: policy.route,
            shouldResetWindow: {
              $lt: [
                { $ifNull: ['$windowStartedAt', new Date(0)] },
                windowStartedAfter,
              ],
            },
          },
        },
        {
          $set: {
            count: {
              $cond: [
                '$shouldResetWindow',
                1,
                { $add: [{ $ifNull: ['$count', 0] }, 1] },
              ],
            },
            windowStartedAt: {
              $cond: ['$shouldResetWindow', now, '$windowStartedAt'],
            },
            expiresAt,
            createdAt: { $ifNull: ['$createdAt', now] },
            updatedAt: now,
          },
        },
        { $unset: 'shouldResetWindow' },
      ],
      { upsert: true, new: true }
    )
      .select({ count: 1, windowStartedAt: 1 })
      .lean<RouteRateLimitRecord>()
  },
}
