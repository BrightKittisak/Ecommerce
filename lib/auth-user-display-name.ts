export const AUTH_USER_FALLBACK_NAME = 'User'

type AuthUserIdentity = {
  name?: string | null
  email?: string | null
}

export function getAuthUserDisplayName(user: AuthUserIdentity) {
  const name = user.name?.trim()
  if (name) return name

  const emailName = user.email?.split('@')[0]?.trim()
  return emailName || AUTH_USER_FALLBACK_NAME
}
