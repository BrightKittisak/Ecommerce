import { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import Link from 'next/link'

import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const PAGE_TITLE = 'การเข้าสู่ระบบและความปลอดภัย'

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
          <span>{PAGE_TITLE}</span>
        </div>
        <h1 className='h1-bold py-4'>{PAGE_TITLE}</h1>
        <Card className='max-w-2xl'>
          <CardContent className='flex flex-wrap justify-between p-4'>
            <div>
              <h3 className='font-bold'>ชื่อ</h3>
              <p>{session?.user.name}</p>
            </div>
            <div>
              <Link href='/account/manage/name'>
                <Button className='w-32 rounded-full' variant='outline'>
                  แก้ไข
                </Button>
              </Link>
            </div>
          </CardContent>
          <Separator />
          <CardContent className='flex flex-wrap justify-between p-4'>
            <div>
              <h3 className='font-bold'>อีเมล</h3>
              <p>{session?.user.email}</p>
              <p>ฟีเจอร์แก้ไขอีเมลจะเพิ่มในเวอร์ชันถัดไป</p>
            </div>
            <div>
              <Link href='#'>
                <Button
                  disabled
                  className='w-32 rounded-full'
                  variant='outline'
                >
                  แก้ไข
                </Button>
              </Link>
            </div>
          </CardContent>
          <Separator />
          <CardContent className='flex flex-wrap justify-between p-4'>
            <div>
              <h3 className='font-bold'>รหัสผ่าน</h3>
              <p>************</p>
              <p>ฟีเจอร์เปลี่ยนรหัสผ่านจะเพิ่มในเวอร์ชันถัดไป</p>
            </div>
            <div>
              <Link href='#'>
                <Button
                  disabled
                  className='w-32 rounded-full'
                  variant='outline'
                >
                  แก้ไข
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </SessionProvider>
    </div>
  )
}
