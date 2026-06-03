import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import SeparatorWithOr from '@/components/shared/separator-or'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import CredentialsSignInForm from './credentials-signin-form'
import { Button } from '@/components/ui/button'
import { sanitizeAuthCallbackUrl } from '@/lib/auth-callback-url'
import { APP_NAME } from '@/lib/constants'
import { GoogleSignInForm } from './google-signin-form'

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ',
}

const authErrorMessages: Record<string, string> = {
  OAuthAccountNotLinked:
    'อีเมลนี้ผูกกับวิธีเข้าสู่ระบบแบบอื่นอยู่ กรุณาเข้าสู่ระบบด้วยวิธีเดิมก่อน',
}

export default async function SignIn(props: {
  searchParams: Promise<{
    callbackUrl: string
    error?: string
  }>
}) {
  const searchParams = await props.searchParams

  const { callbackUrl = '/', error } = searchParams
  const safeCallbackUrl = sanitizeAuthCallbackUrl(callbackUrl)

  const session = await auth()
  if (session) {
    return redirect(safeCallbackUrl)
  }

  const authError = error ? authErrorMessages[error] : null

  return (
    <div className='w-full'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>เข้าสู่ระบบ</CardTitle>
        </CardHeader>
        <CardContent>
          {authError && (
            <div className='mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive'>
              {authError}
            </div>
          )}
          <div>
            <CredentialsSignInForm />
          </div>
          <SeparatorWithOr />
          <div className='mt-4'>
            <GoogleSignInForm />
          </div>
        </CardContent>
      </Card>
      <SeparatorWithOr>เพิ่งเคยใช้ {APP_NAME} ใช่ไหม?</SeparatorWithOr>

      <Link href={`/sign-up?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`}>
        <Button className='w-full' variant='outline'>
          สร้างบัญชี {APP_NAME}
        </Button>
      </Link>
    </div>
  )
}
