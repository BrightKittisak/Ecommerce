import { NextRequest, NextResponse } from 'next/server'

import Product from '@/lib/db/models/product.model'
import { connectToDatabase } from '@/lib/db'
import { parseBrowsingHistoryQuery } from '@/lib/browsing-history-query'
import { PRODUCT_CARD_FIELDS } from '@/lib/product-query-fields'

const MAX_RELATED_PRODUCTS = 24

export const GET = async (request: NextRequest) => {
  const parsedQuery = parseBrowsingHistoryQuery(request.nextUrl.searchParams)

  if (!parsedQuery) return NextResponse.json([])
  const { listType, productIds, categories } = parsedQuery
  const filter =
    listType === 'history'
      ? {
          _id: { $in: productIds },
        }
      : { category: { $in: categories }, _id: { $nin: productIds } }

  await connectToDatabase()
  const products = await Product.find(filter, PRODUCT_CARD_FIELDS)
    .limit(listType === 'history' ? productIds.length : MAX_RELATED_PRODUCTS)
    .lean()

  if (listType === 'history')
    return NextResponse.json(
      products.sort(
        (a, b) =>
          productIds.indexOf(a._id.toString()) -
          productIds.indexOf(b._id.toString())
      )
    )
  return NextResponse.json(products)
}
