type AuthorizedPathAccessInput = {
  pathname: string
  isAuthenticated: boolean
}

export function isAuthorizedPathAccessAllowed({
  pathname,
  isAuthenticated,
}: AuthorizedPathAccessInput) {
  const isAdminPath = /\/admin(\/.*)?/.test(pathname)
  const isProtectedPath =
    /\/checkout(\/.*)?/.test(pathname) || /\/account(\/.*)?/.test(pathname)

  if (isAdminPath) {
    return isAuthenticated
  }

  if (isProtectedPath) {
    return isAuthenticated
  }

  return true
}
