'use client'

import Link from 'next/link'
import { ChevronUp } from 'lucide-react'

import { APP_COPYRIGHT, APP_NAME } from '@/lib/constants'
import { exploreLinks, policyLinks } from '@/lib/site-navigation'
import { Button } from '../ui/button'

export default function Footer() {
  return (
    <footer className='relative mt-16 overflow-hidden border-t border-border/60 bg-[linear-gradient(145deg,rgba(255,249,238,0.98),rgba(246,235,214,0.94)_45%,rgba(225,236,226,0.92))] text-black underline-link'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(221,120,54,0.2),transparent_22rem),radial-gradient(circle_at_78%_18%,rgba(108,146,122,0.18),transparent_18rem),linear-gradient(180deg,rgba(255,255,255,0.34),transparent_55%)]' />
      <div className='pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(48,35,23,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(48,35,23,0.04)_1px,transparent_1px)] [background-position:center] [background-size:32px_32px]' />
      <div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-black/10' />
      <div className='pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(67,43,24,0.05))]' />

      <div className='relative w-full'>
        <Button
          variant='ghost'
          className='w-full rounded-none border-b border-black/10 bg-black/[0.03] py-6 text-sm text-black hover:bg-black/[0.06] hover:text-black sm:text-[15px]'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp className='mr-2 h-4 w-4' />
          กลับขึ้นด้านบน
        </Button>
      </div>

      <div className='page-shell relative py-10'>
        <div className='grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]'>
          <div className='space-y-3'>
            <p className='eyebrow text-black/60'>ประสบการณ์ช้อปที่ตั้งใจออกแบบ</p>
            <h2 className='font-serif text-[2rem] font-semibold leading-tight sm:text-[2.4rem]'>
              {APP_NAME}
            </h2>
            <p className='max-w-md text-sm leading-7 text-black/80 sm:text-base'>
              รวมสินค้าจำเป็นที่คัดมาแล้วให้ค้นหาง่าย อ่านสบายตา และซื้อได้ลื่นขึ้นทั้งบนมือถือและเดสก์ท็อป
            </p>
          </div>

          <div className='space-y-3 text-sm sm:text-[15px]'>
            <p className='font-semibold uppercase tracking-[0.2em] text-black/60'>
              สำรวจ
            </p>
            <div className='flex flex-col gap-2'>
              {exploreLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className='space-y-3 text-sm sm:text-[15px]'>
            <p className='font-semibold uppercase tracking-[0.2em] text-black/60'>
              นโยบาย
            </p>
            <div className='flex flex-col gap-2'>
              {policyLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className='mt-10 flex justify-center text-sm text-black/85 sm:text-[15px]'>
          <p>{APP_COPYRIGHT}</p>
        </div>
        <div className='mt-3 flex justify-center text-center text-sm leading-7 text-black/65 sm:text-[15px]'>
          123 ถนนสุขุมวิท กรุงเทพมหานคร 10110 | +66 2 123 4567
        </div>
      </div>
    </footer>
  )
}
