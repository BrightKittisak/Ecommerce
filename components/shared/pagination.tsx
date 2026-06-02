'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

import { formUrlQuery } from '@/lib/utils'
import { normalizePaginationPage } from '@/lib/pagination'

import { Button } from '../ui/button'

type PaginationProps = {
  page: number | string
  totalPages: number
  urlParamName?: string
}

const Pagination = ({ page, totalPages, urlParamName }: PaginationProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = normalizePaginationPage(page)

  const onClick = (btnType: string) => {
    const pageValue = btnType === 'next' ? currentPage + 1 : currentPage - 1

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: urlParamName || 'page',
      value: pageValue.toString(),
    })

    router.push(newUrl, { scroll: true })
  }
  return (
    <div className='flex gap-2'>
      <Button
        size='lg'
        variant='outline'
        className='w-28'
        onClick={() => onClick('prev')}
        disabled={currentPage <= 1}
      >
        ก่อนหน้า
      </Button>
      <Button
        size='lg'
        variant='outline'
        className='w-28'
        onClick={() => onClick('next')}
        disabled={currentPage >= totalPages}
      >
        ถัดไป
      </Button>
    </div>
  )
}

export default Pagination
