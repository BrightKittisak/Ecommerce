import { NextResponse } from 'next/server'

import { getAllCategories } from '@/lib/actions/product.actions'
import { getCatalogCategoriesHeaders } from '@/lib/catalog-categories-response-headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const categories = await getAllCategories()

  return NextResponse.json(categories, {
    headers: getCatalogCategoriesHeaders(),
  })
}
