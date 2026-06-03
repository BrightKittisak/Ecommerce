import { NextRequest, NextResponse } from 'next/server'

import { getBrowsingHistoryProducts } from '@/lib/application/products/browsing-history-query'
import { connectToDatabase } from '@/lib/db'
import { browsingHistoryProductDeps } from '@/lib/infrastructure/products/browsing-history-product-deps'
import { parseBrowsingHistoryQuery } from '@/lib/browsing-history-query'

export const GET = async (request: NextRequest) => {
  const parsedQuery = parseBrowsingHistoryQuery(request.nextUrl.searchParams)

  if (!parsedQuery) return NextResponse.json([])

  await connectToDatabase()
  const products = await getBrowsingHistoryProducts({
    query: parsedQuery,
    deps: browsingHistoryProductDeps,
  })

  return NextResponse.json(products)
}
