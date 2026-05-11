import { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import Link from 'next/link'

import { auth } from '@/auth'
import { Card, CardContent } from '@/components/ui/card'
import { APP_NAME } from '@/lib/constants'

import { ProfileForm } from './profile-form'

const PAGE_TITLE = 'เปลี่ยนชื่อของคุณ'

export const metadata: Metadata = {
  title: PAGE_TITLE,
}

export default async function ProfilePage() {
  const session = await auth()

  return (
    <div className='mb-24'>
      <SessionProvider session={session}>
        <div className='flex gap-2'>
          <Link href='/account'>บัญชีของคุณ</Link>
          <span>/</span>
          <Link href='/account/manage'>การเข้าสู่ระบบและความปลอดภัย</Link>
          <span>/</span>
          <span>{PAGE_TITLE}</span>
        </div>
        <h1 className='h1-bold py-4'>{PAGE_TITLE}</h1>
        <Card className='max-w-2xl'>
          <CardContent className='flex flex-wrap justify-between p-4'>
            <p className='py-2 text-sm'>
              หากคุณต้องการเปลี่ยนชื่อที่เชื่อมกับบัญชี {APP_NAME}
              {' '}สามารถแก้ไขได้ด้านล่าง และอย่าลืมกดบันทึกเมื่อเสร็จแล้ว
            </p>
            <ProfileForm />
          </CardContent>
        </Card>
      </SessionProvider>
    </div>
  )
}
