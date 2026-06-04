import { NextResponse } from 'next/server'

import { getAllCategories } from '@/lib/actions/product.actions'
import {
  assertRouteRateLimit,
  createRateLimitedResponse,
  getRateLimitHeaders,
  ROUTE_RATE_LIMIT_POLICIES,
} from '@/lib/route-rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const rateLimit = await assertRouteRateLimit({
    policy: ROUTE_RATE_LIMIT_POLICIES.catalogCategories,
    request,
  })

  if (!rateLimit.allowed) return createRateLimitedResponse(rateLimit)

  const categories = await getAllCategories()

  return NextResponse.json(categories, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      ...getRateLimitHeaders(rateLimit),
    },
  })
}
