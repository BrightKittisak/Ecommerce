'use client'

import Link from 'next/link'
import { ChevronUp } from 'lucide-react'

import { APP_COPYRIGHT, APP_NAME } from '@/lib/constants'
import { Button } from '../ui/button'

export default function Footer() {
  return (
    <footer className='mt-16 border-t border-border/60 bg-foreground text-white underline-link'>
      <div className='w-full'>
        <Button
          variant='ghost'
          className='w-full rounded-none bg-white/5 py-6 text-white hover:bg-white/10 hover:text-white'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp className='mr-2 h-4 w-4' />
          กลับขึ้นด้านบน
        </Button>
      </div>
      <div className='page-shell py-10'>
        <div className='grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]'>
          <div className='space-y-3'>
            <p className='eyebrow text-white/60'>ประสบการณ์ช้อปที่ตั้งใจออกแบบ</p>
            <h2 className='font-serif text-4xl font-semibold'>{APP_NAME}</h2>
            <p className='max-w-md text-sm text-white/70'>
              รวมสินค้าจำเป็นที่คัดมาแล้วให้ค้นหาง่าย อ่านสบายตา และซื้อได้ลื่นขึ้นทั้งบนมือถือและเดสก์ท็อป
            </p>
          </div>
          <div className='space-y-3 text-sm'>
            <p className='font-semibold uppercase tracking-[0.2em] text-white/60'>
              สำรวจ
            </p>
            <div className='flex flex-col gap-2'>
              <Link href='/page/about-us'>เกี่ยวกับเรา</Link>
              <Link href='/page/customer-service'>บริการลูกค้า</Link>
              <Link href='/page/help'>ศูนย์ช่วยเหลือ</Link>
            </div>
          </div>
          <div className='space-y-3 text-sm'>
            <p className='font-semibold uppercase tracking-[0.2em] text-white/60'>
              นโยบาย
            </p>
            <div className='flex flex-col gap-2'>
              <Link href='/page/conditions-of-use'>เงื่อนไขการใช้งาน</Link>
              <Link href='/page/privacy-policy'>นโยบายความเป็นส่วนตัว</Link>
              <Link href='/page/returns-policy'>นโยบายการคืนสินค้า</Link>
            </div>
          </div>
        </div>
        <div className='mt-10 flex justify-center text-sm text-white/75'>
          <p>{APP_COPYRIGHT}</p>
        </div>
        <div className='mt-3 flex justify-center text-sm text-white/45'>
          123 ถนนสุขุมวิท กรุงเทพมหานคร 10110 | +66 2 123 4567
        </div>
      </div>
    </footer>
  )
}
