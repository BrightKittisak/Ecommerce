'use client'
import { useFormStatus } from 'react-dom'

import { Button } from '@/components/ui/button'
import { SignInWithGoogle } from '@/lib/actions/user.actions'

export function GoogleSignInForm() {
  const SignInButton = () => {
    const { pending } = useFormStatus()
    return (
      <Button disabled={pending} className='w-full' variant='outline'>
        {pending ? 'กำลังพาไปยัง Google...' : 'เข้าสู่ระบบด้วย Google'}
      </Button>
    )
  }
  return (
    <form action={SignInWithGoogle}>
      <SignInButton />
    </form>
  )
}
