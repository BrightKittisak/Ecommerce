import { NextResponse } from 'next/server'

import { checkReadiness } from '@/lib/application/health/readiness'
import { mongoReadinessDeps } from '@/lib/infrastructure/health/mongo-readiness-deps'

export const dynamic = 'force-dynamic'

export async function GET() {
  const result = await checkReadiness({ deps: mongoReadinessDeps })

  return NextResponse.json(result.body, {
    status: result.status,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
