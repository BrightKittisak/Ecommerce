export class RequestBodyTooLargeError extends Error {
  constructor() {
    super('Request body exceeds the configured limit')
    this.name = 'RequestBodyTooLargeError'
  }
}

function contentLengthExceedsLimit(request: Request, maxBytes: number) {
  const contentLength = request.headers.get('content-length')

  if (!contentLength || !/^\d+$/.test(contentLength)) return false

  return Number(contentLength) > maxBytes
}

export async function readRequestTextWithLimit(
  request: Request,
  maxBytes: number
) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new RangeError('maxBytes must be a positive safe integer')
  }

  if (contentLengthExceedsLimit(request, maxBytes)) {
    throw new RequestBodyTooLargeError()
  }

  if (!request.body) return ''

  const reader = request.body.getReader()
  const decoder = new TextDecoder()
  const chunks: string[] = []
  let receivedBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      receivedBytes += value.byteLength

      if (receivedBytes > maxBytes) {
        await reader.cancel().catch(() => undefined)
        throw new RequestBodyTooLargeError()
      }

      chunks.push(decoder.decode(value, { stream: true }))
    }

    chunks.push(decoder.decode())
    return chunks.join('')
  } finally {
    reader.releaseLock()
  }
}
