import { NextRequest, NextResponse } from 'next/server'

import { getBrowsingHistoryProducts } from '@/lib/application/products/browsing-history-query'
import { browsingHistoryProductDeps } from '@/lib/infrastructure/products/browsing-history-product-deps'
import { parseBrowsingHistoryQuery } from '@/lib/browsing-history-query'
import { getBrowsingHistoryHeaders } from '@/lib/browsing-history-response-headers'
import { logger } from '@/lib/logger'
import {
  assertRouteRateLimit,
  createRateLimitedResponse,
  getRateLimitLogMetadata,
  ROUTE_RATE_LIMIT_POLICIES,
} from '@/lib/route-rate-limit'

export const GET = async (request: NextRequest) => {
  const rateLimit = await assertRouteRateLimit({
    policy: ROUTE_RATE_LIMIT_POLICIES.browsingHistoryProducts,
    request,
  })

  if (!rateLimit.allowed) {
    logger.warn(
      'api.browsing_history_rate_limited',
      getRateLimitLogMetadata(
        ROUTE_RATE_LIMIT_POLICIES.browsingHistoryProducts,
        rateLimit
      )
    )
    return createRateLimitedResponse(rateLimit)
  }

  const parsedQuery = parseBrowsingHistoryQuery(request.nextUrl.searchParams)

  if (!parsedQuery) {
    return NextResponse.json([], {
      headers: getBrowsingHistoryHeaders(rateLimit),
    })
  }

  const products = await getBrowsingHistoryProducts({
    query: parsedQuery,
    deps: browsingHistoryProductDeps,
  })

  return NextResponse.json(products, {
    headers: getBrowsingHistoryHeaders(rateLimit),
  })
}
