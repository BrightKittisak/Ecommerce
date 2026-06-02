type LogMetadata = Record<string, unknown>

type SerializedLogError = {
  name?: string
  message: string
}

export function serializeLogError(error: unknown): SerializedLogError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    }
  }

  if (typeof error === 'string') {
    return { message: error }
  }

  return { message: 'Unknown error' }
}

export const logger = {
  error(event: string, metadata: LogMetadata = {}) {
    console.error(
      JSON.stringify({
        level: 'error',
        event,
        timestamp: new Date().toISOString(),
        ...metadata,
      })
    )
  },
}
