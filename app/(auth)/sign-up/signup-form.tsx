'use client'

import Link from 'next/link'
import { redirect, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

import { registerUser, signInWithCredentials } from '@/lib/actions/user.actions'
import { sanitizeAuthCallbackUrl } from '@/lib/auth-callback-url'
import { UserSignUpSchema } from '@/lib/auth-validator'
import { APP_NAME } from '@/lib/constants'
import { IUserSignUp } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export default function SignUpForm() {
  const searchParams = useSearchParams()
  const callbackUrl = sanitizeAuthCallbackUrl(searchParams.get('callbackUrl'))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<IUserSignUp>({
    resolver: zodResolver(UserSignUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const { control, handleSubmit, setError } = form

  const onSubmit = async (data: IUserSignUp) => {
    setIsSubmitting(true)
    try {
      const res = await registerUser(data)
      if (!res.success) {
        setError('email', { message: res.error })
        toast.error(res.error)
        return
      }

      await signInWithCredentials({
        email: data.email,
        password: data.password,
      })
      redirect(callbackUrl)
    } catch (error) {
      if (isRedirectError(error)) throw error
      toast.error('เน€เธเธดเธ”เธเธฑเธเธซเธฒเธเธฒเธเธญเธขเนเธฒเธ เธเธฃเธธเธ“เธฒเธฅเธญเธเนเธซเธกเนเธญเธตเธเธเธฃเธฑเนเธ')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type='hidden' name='callbackUrl' value={callbackUrl} />
        <div className='space-y-6'>
          <FormField
            control={control}
            name='name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>เธเธทเนเธญ</FormLabel>
                <FormControl>
                  <Input placeholder='เธเธฃเธญเธเธเธทเนเธญเธเธญเธเธเธธเธ“' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='email'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>เธญเธตเน€เธกเธฅ</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='เธเธฃเธญเธเธญเธตเน€เธกเธฅ'
                    autoComplete='email'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='password'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>เธฃเธซเธฑเธชเธเนเธฒเธ</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='เธเธฃเธญเธเธฃเธซเธฑเธชเธเนเธฒเธ'
                    autoComplete='new-password'
                    {...field}
                  />
                </FormControl>
                <p className='text-xs text-muted-foreground'>
                  Use at least 8 characters with uppercase, lowercase, number,
                  and special character.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>เธขเธทเธเธขเธฑเธเธฃเธซเธฑเธชเธเนเธฒเธ</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='เธเธฃเธญเธเธฃเธซเธฑเธชเธเนเธฒเธเธญเธตเธเธเธฃเธฑเนเธ'
                    autoComplete='new-password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'เธเธณเธฅเธฑเธเธชเธกเธฑเธเธฃเธชเธกเธฒเธเธดเธ...' : 'เธชเธกเธฑเธเธฃเธชเธกเธฒเธเธดเธ'}
            </Button>
          </div>

          <div className='text-sm'>
            เน€เธกเธทเนเธญเธชเธฃเนเธฒเธเธเธฑเธเธเธต เนเธเธฅเธงเนเธฒเธเธธเธ“เธขเธญเธกเธฃเธฑเธ{' '}
            <Link href='/page/conditions-of-use'>เน€เธเธทเนเธญเธเนเธเธเธฒเธฃเนเธเนเธเธฒเธ</Link>{' '}
            เนเธฅเธฐ{' '}
            <Link href='/page/privacy-policy'>เธเนเธขเธเธฒเธขเธเธงเธฒเธกเน€เธเนเธเธชเนเธงเธเธ•เธฑเธง</Link>{' '}
            เธเธญเธ {APP_NAME}
          </div>

          <Separator className='mb-4' />

          <div className='text-sm'>
            เธกเธตเธเธฑเธเธเธตเธญเธขเธนเนเนเธฅเนเธง?{' '}
            <Link
              className='link'
              href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            >
              เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธ
            </Link>
          </div>
        </div>
      </form>
    </Form>
  )
}
