const DEFAULT_AUTH_CALLBACK_URL = '/'

export function sanitizeAuthCallbackUrl(callbackUrl: string | null | undefined) {
  if (!callbackUrl) return DEFAULT_AUTH_CALLBACK_URL

  const trimmedCallbackUrl = callbackUrl.trim()

  if (
    !trimmedCallbackUrl.startsWith('/') ||
    trimmedCallbackUrl.startsWith('//')
  ) {
    return DEFAULT_AUTH_CALLBACK_URL
  }

  return trimmedCallbackUrl
}
