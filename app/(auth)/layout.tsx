import { APP_COPYRIGHT } from '@/lib/constants'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export const dynamic = 'force-dynamic'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex min-h-screen flex-col items-center highlight-link'>
      <header className='mt-8'>
        <Link href='/'>
          <Image
            src='/icons/logo.svg'
            alt='logo'
            width={64}
            height={64}
            priority
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </Link>
      </header>
      <main className='mx-auto max-w-sm min-w-80 p-4'>{children}</main>
      <footer className='mt-8 flex w-full flex-1 flex-col items-center gap-4 bg-foreground p-8 text-sm text-white/80'>
        <div className='flex justify-center space-x-4'>
          <Link href='/page/conditions-of-use'>เงื่อนไขการใช้งาน</Link>
          <Link href='/page/privacy-policy'>นโยบายความเป็นส่วนตัว</Link>
          <Link href='/page/help'>ช่วยเหลือ</Link>
        </div>
        <div>
          <p className='text-white/50'>{APP_COPYRIGHT}</p>
        </div>
      </footer>
    </div>
  )
}
