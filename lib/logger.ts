type LogMetadata = Record<string, unknown>
type LogLevel = 'error' | 'warn'

type SerializedLogError = {
  name?: string
  message: string
}

const URI_CREDENTIALS_PATTERN = /([a-z][a-z\d+.-]*:\/\/)[^@\s/]+@/gi

function redactLogMessage(message: string) {
  return message.replace(URI_CREDENTIALS_PATTERN, '$1[REDACTED]@')
}

export function serializeLogError(error: unknown): SerializedLogError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: redactLogMessage(error.message),
    }
  }

  if (typeof error === 'string') {
    return { message: redactLogMessage(error) }
  }

  return { message: 'Unknown error' }
}

function writeLog(
  level: LogLevel,
  event: string,
  metadata: LogMetadata,
  output: (message: string) => void
) {
  output(
    JSON.stringify({
      ...metadata,
      level,
      event,
      timestamp: new Date().toISOString(),
    })
  )
}

export const logger = {
  error(event: string, metadata: LogMetadata = {}) {
    writeLog('error', event, metadata, console.error)
  },
  warn(event: string, metadata: LogMetadata = {}) {
    writeLog('warn', event, metadata, console.warn)
  },
}
