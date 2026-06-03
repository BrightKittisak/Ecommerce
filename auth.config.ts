import type { NextAuthConfig } from 'next-auth'

import { isAuthorizedPathAccessAllowed } from './lib/auth-authorization'

type AuthorizedCallback = NonNullable<
  NonNullable<NextAuthConfig['callbacks']>['authorized']
>
type AuthorizedCallbackInput = Parameters<AuthorizedCallback>[0]

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [],
  callbacks: {
    authorized({ request, auth }: AuthorizedCallbackInput) {
      return isAuthorizedPathAccessAllowed({
        pathname: request.nextUrl.pathname,
        isAuthenticated: !!auth,
      })
    },
  },
} satisfies NextAuthConfig
