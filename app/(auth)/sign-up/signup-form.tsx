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
      toast.error('เกิดปัญหาบางอย่าง กรุณาลองใหม่อีกครั้ง')
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
                <FormLabel>ชื่อ</FormLabel>
                <FormControl>
                  <Input placeholder='กรอกชื่อของคุณ' {...field} />
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
                <FormLabel>อีเมล</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='กรอกอีเมล'
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
                <FormLabel>รหัสผ่าน</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='กรอกรหัสผ่าน'
                    autoComplete='new-password'
                    {...field}
                  />
                </FormControl>
                <p className='text-xs text-muted-foreground'>
                  ใช้อย่างน้อย 8 ตัวอักษร โดยมีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก
                  ตัวเลข และอักขระพิเศษ
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
                <FormLabel>ยืนยันรหัสผ่าน</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='กรอกรหัสผ่านอีกครั้ง'
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
              {isSubmitting ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </Button>
          </div>

          <div className='text-sm'>
            เมื่อสร้างบัญชี แปลว่าคุณยอมรับ{' '}
            <Link href='/page/conditions-of-use'>เงื่อนไขการใช้งาน</Link>{' '}
            และ{' '}
            <Link href='/page/privacy-policy'>นโยบายความเป็นส่วนตัว</Link>{' '}
            ของ {APP_NAME}
          </div>

          <Separator className='mb-4' />

          <div className='text-sm'>
            มีบัญชีอยู่แล้ว?{' '}
            <Link
              className='link'
              href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </form>
    </Form>
  )
}
