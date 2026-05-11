'use client'
import { redirect, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { IUserSignUp } from '@/types'
import { registerUser, signInWithCredentials } from '@/lib/actions/user.actions'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserSignUpSchema } from '@/lib/validator'
import { Separator } from '@/components/ui/separator'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { APP_NAME } from '@/lib/constants'

export default function SignUpForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
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
        setError('email', { message: res.error }) // แสดง error ในช่อง email
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
                  <Input type='email' placeholder='กรอกอีเมล' {...field} />
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
                  <Input type='password' placeholder='กรอกรหัสผ่าน' {...field} />
                </FormControl>
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
                  <Input type='password' placeholder='กรอกรหัสผ่านอีกครั้ง' {...field} />
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
            เมื่อสร้างบัญชี แปลว่าคุณยอมรับ
            {' '}
            <Link href='/page/conditions-of-use'>เงื่อนไขการใช้งาน</Link>
            {' '}และ{' '}
            <Link href='/page/privacy-policy'>นโยบายความเป็นส่วนตัว</Link>
            {' '}ของ {APP_NAME}
          </div>

          <Separator className='mb-4' />

          <div className='text-sm'>
            มีบัญชีอยู่แล้ว?{' '}
            <Link className='link' href={`/sign-in?callbackUrl=${callbackUrl}`}>
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </form>
    </Form>
  )
}
