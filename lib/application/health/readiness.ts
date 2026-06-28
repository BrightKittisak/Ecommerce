import { APP_NAME } from '../../constants'

export type ReadinessDeps = {
  checkDatabase(): Promise<void>
}

export type ReadinessStatus = {
  ready: boolean
  service: string
  checks: {
    database: 'up' | 'down'
  }
  timestamp: string
}

export type ReadinessResult = {
  status: 200 | 503
  body: ReadinessStatus
}

type CheckReadinessInput = {
  deps: ReadinessDeps
  now?: () => Date
  timeoutMs?: number
}

export async function checkReadiness({
  deps,
  now = () => new Date(),
  timeoutMs = 2000,
}: CheckReadinessInput): Promise<ReadinessResult> {
  let timeout: ReturnType<typeof setTimeout> | undefined

  try {
    await Promise.race([
      deps.checkDatabase(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error('Readiness check timed out')),
          timeoutMs
        )
      }),
    ])

    return {
      status: 200,
      body: {
        ready: true,
        service: APP_NAME,
        checks: { database: 'up' },
        timestamp: now().toISOString(),
      },
    }
  } catch {
    return {
      status: 503,
      body: {
        ready: false,
        service: APP_NAME,
        checks: { database: 'down' },
        timestamp: now().toISOString(),
      },
    }
  } finally {
    if (timeout) {
      clearTimeout(timeout)
    }
  }
}
