import type { NextAuthConfig } from 'next-auth'

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authorized({ request, auth }: any) {
      const { pathname } = request.nextUrl
      const isAdminPath = /\/admin(\/.*)?/.test(pathname)
      const isProtectedPath =
        /\/checkout(\/.*)?/.test(pathname) || /\/account(\/.*)?/.test(pathname)

      if (isAdminPath) {
        if (!auth) return false

        if (auth.user?.role !== 'Admin') {
          return Response.redirect(new URL('/account', request.nextUrl))
        }

        return true
      }

      if (isProtectedPath) return !!auth
      return true
    },
  },
} satisfies NextAuthConfig
