'use client'
import React from 'react'

import { Button } from '@/components/ui/button'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className='flex min-h-screen items-center justify-center px-4'>
      <div className='section-shell w-full max-w-xl p-8 text-center'>
        <h1 className='mb-4 text-3xl font-bold'>เกิดข้อผิดพลาดบางอย่าง</h1>
        <p className='text-destructive'>{error.message}</p>
        <Button variant='outline' className='mt-4' onClick={() => reset()}>
          ลองใหม่อีกครั้ง
        </Button>
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
