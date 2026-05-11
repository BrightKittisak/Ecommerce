'use client'
import React from 'react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className='flex min-h-screen items-center justify-center px-4'>
      <div className='section-shell w-full max-w-xl p-8 text-center'>
        <h1 className='mb-4 text-3xl font-bold'>ไม่พบหน้าที่คุณต้องการ</h1>
        <p className='text-destructive'>ระบบไม่พบข้อมูลหรือหน้าที่ร้องขอ</p>
        <Button
          variant='outline'
          className='mt-4 ml-2'
          onClick={() => (window.location.href = '/')}
        >
          กลับหน้าแรก
        </Button>
      </div>
    </div>
  )
}
