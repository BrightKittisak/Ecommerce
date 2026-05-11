import Link from 'next/link'
import { Home, PackageCheckIcon, User } from 'lucide-react'
import { Metadata } from 'next'

import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import { Card, CardContent } from '@/components/ui/card'

const PAGE_TITLE = 'บัญชีของคุณ'

export const metadata: Metadata = {
  title: PAGE_TITLE,
}

export default function AccountPage() {
  return (
    <div className='space-y-6'>
      <div className='section-shell p-6 md:p-8'>
        <p className='eyebrow mb-3'>ศูนย์จัดการบัญชี</p>
        <h1 className='h1-bold'>{PAGE_TITLE}</h1>
        <p className='mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base'>
          จัดการคำสั่งซื้อ ข้อมูลเข้าสู่ระบบ และรายละเอียดโปรไฟล์ของคุณได้จากที่เดียว
        </p>
      </div>
      <div className='grid items-stretch gap-4 md:grid-cols-3'>
        <Card>
          <Link href='/account/orders'>
            <CardContent className='flex items-start gap-4 p-6'>
              <div>
                <PackageCheckIcon className='h-12 w-12' />
              </div>
              <div>
                <h2 className='text-xl font-bold'>คำสั่งซื้อ</h2>
                <p className='text-muted-foreground'>
                  ติดตามคำสั่งซื้อ ดูรายละเอียด หรือกลับมาซื้อซ้ำได้สะดวก
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card>
          <Link href='/account/manage'>
            <CardContent className='flex items-start gap-4 p-6'>
              <div>
                <User className='h-12 w-12' />
              </div>
              <div>
                <h2 className='text-xl font-bold'>การเข้าสู่ระบบและความปลอดภัย</h2>
                <p className='text-muted-foreground'>
                  จัดการชื่อ อีเมล รหัสผ่าน และข้อมูลการเข้าใช้งาน
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card>
          <Link href='/account/manage/name'>
            <CardContent className='flex items-start gap-4 p-6'>
              <div>
                <Home className='h-12 w-12' />
              </div>
              <div>
                <h2 className='text-xl font-bold'>ข้อมูลที่อยู่</h2>
                <p className='text-muted-foreground'>
                  แก้ไขข้อมูลโปรไฟล์และที่อยู่ที่ใช้ในการสั่งซื้อ
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
      <BrowsingHistoryList className='mt-16' />
    </div>
  )
}
