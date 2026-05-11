'use server'
import { auth, signIn, signOut } from '@/auth'
import { IUserName,IUserSignIn, IUserSignUp } from '@/types'
import bcrypt from 'bcryptjs'
import { UserSignUpSchema } from '../validator'
import { connectToDatabase } from '../db'
import User from '../db/models/user.model'
import { formatError } from '../utils'
import { redirect } from 'next/navigation'

export async function signInWithCredentials(user: IUserSignIn) {
  return await signIn('credentials', { ...user, redirect: false })
}
export const SignOut = async () => {
  const redirectTo = await signOut({ redirect: false })
  redirect(redirectTo.redirect)
}

export const SignInWithGoogle = async () => {
  await signIn('google')
}

// CREATE
export async function registerUser(userSignUp: IUserSignUp) {
  try {
    const user = await UserSignUpSchema.parseAsync({
      name: userSignUp.name,
      email: userSignUp.email,
      password: userSignUp.password,
      confirmPassword: userSignUp.confirmPassword,
    })

    await connectToDatabase()
    await User.create({
      ...user,
      password: await bcrypt.hash(user.password, 5),
    })
    return { success: true, message: 'สร้างบัญชีผู้ใช้เรียบร้อยแล้ว' }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

// UPDATE
export async function updateUserName(user: IUserName) {
  try {
    await connectToDatabase()
    const session = await auth()
    const currentUser = await User.findById(session?.user?.id)
    if (!currentUser) throw new Error('ไม่พบบัญชีผู้ใช้')
    currentUser.name = user.name
    const updatedUser = await currentUser.save()
    return {
      success: true,
      message: 'อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว',
      data: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
