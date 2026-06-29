import { NextResponse } from 'next/server'

import { checkReadiness } from '@/lib/application/health/readiness'
import { mongoReadinessDeps } from '@/lib/infrastructure/health/mongo-readiness-deps'
import { logger, serializeLogError } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET() {
  const result = await checkReadiness({
    deps: mongoReadinessDeps,
    onFailure: ({ check, error, timedOut, timeoutMs }) => {
      logger.error('health.readiness_failed', {
        check,
        timedOut,
        timeoutMs,
        error: serializeLogError(error),
      })
    },
  })

  return NextResponse.json(result.body, {
    status: result.status,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
