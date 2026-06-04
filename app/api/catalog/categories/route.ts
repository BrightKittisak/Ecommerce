import { NextResponse } from 'next/server'

import { getAllCategories } from '@/lib/actions/product.actions'

export const dynamic = 'force-dynamic'

export async function GET() {
  const categories = await getAllCategories()

  return NextResponse.json(categories, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
