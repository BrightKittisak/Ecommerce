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

export type ReadinessFailure = {
  check: 'database'
  error: unknown
  timedOut: boolean
  timeoutMs: number
}

type CheckReadinessInput = {
  deps: ReadinessDeps
  now?: () => Date
  onFailure?: (failure: ReadinessFailure) => void
  timeoutMs?: number
}

class ReadinessTimeoutError extends Error {
  constructor() {
    super('Readiness check timed out')
    this.name = 'ReadinessTimeoutError'
  }
}

export async function checkReadiness({
  deps,
  now = () => new Date(),
  onFailure,
  timeoutMs = 2000,
}: CheckReadinessInput): Promise<ReadinessResult> {
  let timeout: ReturnType<typeof setTimeout> | undefined

  try {
    await Promise.race([
      deps.checkDatabase(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new ReadinessTimeoutError()),
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
  } catch (error) {
    try {
      onFailure?.({
        check: 'database',
        error,
        timedOut: error instanceof ReadinessTimeoutError,
        timeoutMs,
      })
    } catch {
      // Observability must not change readiness semantics.
    }

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
