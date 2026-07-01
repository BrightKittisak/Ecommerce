'use server'

import { auth, signIn, signOut } from '@/auth'
import { registerUserAccount } from '@/lib/application/users/register-user-account'
import { updateUserNameForAccount } from '@/lib/application/users/update-user-name'
import { userAccountDeps } from '@/lib/infrastructure/users/user-account-deps'
import { IUserName, IUserSignIn, IUserSignUp } from '@/types'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { UserSignInSchema } from '../domain/user/auth.schema'
import { RateLimitError } from '../rate-limit-error'
import { getClientIpFromHeaders } from '../request-ip'
import {
  assertRouteRateLimitForIdentity,
  ROUTE_RATE_LIMIT_POLICIES,
} from '../route-rate-limit'
import { getUserActionErrorMessage } from '../user-action-errors'

export async function signInWithCredentials(user: IUserSignIn) {
  const credentials = UserSignInSchema.parse(user)
  return await signIn('credentials', { ...credentials, redirect: false })
}

export const SignOut = async () => {
  const redirectTo = await signOut({ redirect: false })
  redirect(redirectTo.redirect)
}

export const SignInWithGoogle = async () => {
  await signIn('google')
}

export async function registerUser(userSignUp: IUserSignUp) {
  try {
    const requestHeaders = await headers()
    const rateLimit = await assertRouteRateLimitForIdentity({
      identity: getClientIpFromHeaders(requestHeaders),
      policy: ROUTE_RATE_LIMIT_POLICIES.userRegistration,
    })

    if (!rateLimit.allowed) throw new RateLimitError()

    await registerUserAccount({
      userSignUp,
      deps: userAccountDeps,
    })
    return {
      success: true,
      message: 'สร้างบัญชีผู้ใช้เรียบร้อยแล้ว',
    }
  } catch (error) {
    return { success: false, error: getUserActionErrorMessage(error) }
  }
}

export async function updateUserName(user: IUserName) {
  try {
    const session = await auth()
    const updatedUser = await updateUserNameForAccount({
      userId: session?.user?.id,
      user,
      deps: userAccountDeps,
    })

    return {
      success: true,
      message: 'อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว',
      data: updatedUser,
    }
  } catch (error) {
    return { success: false, message: getUserActionErrorMessage(error) }
  }
}
