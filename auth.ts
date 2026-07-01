import { MongoDBAdapter } from '@auth/mongodb-adapter'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from './lib/db'
import getMongoClient from './lib/db/client'
import User, { type IUser } from './lib/db/models/user.model'
import {
  AuthRateLimitError,
  assertSignInAllowed,
  clearSignInFailures,
  getSignInRateLimitKeys,
  recordFailedSignIn,
} from './lib/auth-rate-limit'
import { UserSignInSchema } from './lib/domain/user/auth.schema'
import { getAuthUserDisplayName } from './lib/auth-user-display-name'
import { logger } from './lib/logger'

import NextAuth, { type DefaultSession } from 'next-auth'
import authConfig from './auth.config'

declare module 'next-auth' {
  interface Session {
    user: {
      role: string
    } & DefaultSession['user']
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  pages: {
    signIn: '/sign-in',
    newUser: '/sign-up',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: MongoDBAdapter(() => getMongoClient()),
  providers: [
    Google({
      allowDangerousEmailAccountLinking: false,
    }),
    CredentialsProvider({
      credentials: {
        email: {
          type: 'email',
        },
        password: { type: 'password' },
      },
      async authorize(credentials, request) {
        await connectToDatabase()
        const parsedCredentials = UserSignInSchema.safeParse(credentials)
        if (!parsedCredentials.success) return null

        const { email: rawEmail, password } = parsedCredentials.data
        const email = rawEmail.trim().toLowerCase()
        const rateLimitKeys = getSignInRateLimitKeys({ email, request })
        try {
          await assertSignInAllowed(rateLimitKeys)
        } catch (error) {
          if (error instanceof AuthRateLimitError) {
            logger.warn('auth.sign_in_rate_limited', {
              scopes: rateLimitKeys.map(({ scope }) => scope),
            })
          }
          throw error
        }

        const user = await User.findOne({ email })
          .collation({ locale: 'en', strength: 2 })

        if (user && user.password) {
          const isMatch = await bcrypt.compare(password, user.password)
          if (isMatch) {
            await clearSignInFailures(rateLimitKeys)
            return {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            }
          }
        }
        await recordFailedSignIn(rateLimitKeys)
        return null
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      // Sign in
      if (user) {
        const displayName = getAuthUserDisplayName(user)

        // Update database if user has no name (first sign-in)
        if (!user.name) {
          await connectToDatabase()
          await User.findByIdAndUpdate(user.id, {
            name: displayName,
            role: (user as IUser).role || 'User', // Preserve existing role
          })
        }
        
        // Set token properties from user object
        token.name = displayName
        token.role = (user as { role?: string }).role || 'User'
      }
      
      return token
    },
    session: async ({ session, token }) => {
      // Set user properties from token
      session.user.id = token.sub as string
      session.user.role = token.role as string
      session.user.name = token.name
      
      return session
    },
  },
})
