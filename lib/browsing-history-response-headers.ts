import {
  getRateLimitHeaders,
  type RouteRateLimitDecision,
} from './route-rate-limit'

export const getBrowsingHistoryHeaders = (
  rateLimit: RouteRateLimitDecision
) => ({
  'Cache-Control': 'private, no-store',
  ...getRateLimitHeaders(rateLimit),
})
