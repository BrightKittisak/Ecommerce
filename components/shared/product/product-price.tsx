'use client'

import { cn, formatCurrency, formatCurrencyParts } from '@/lib/utils'

const ProductPrice = ({
  price,
  className,
  listPrice = 0,
  isDeal = false,
  forListing = true,
  plain = false,
}: {
  price: number
  isDeal?: boolean
  listPrice?: number
  className?: string
  forListing?: boolean
  plain?: boolean
}) => {
  const discountPercent = Math.round(100 - (price / listPrice) * 100)
  const { symbol, integer, fraction } = formatCurrencyParts(price)

  return plain ? (
    formatCurrency(price)
  ) : listPrice == 0 ? (
    <div className={cn('text-3xl', className)}>
      <span className='align-super text-xs'>{symbol}</span>
      {integer}
      <span className='align-super text-xs'>.{fraction}</span>
    </div>
  ) : isDeal ? (
    <div className='space-y-2'>
      <div className='flex items-center justify-center gap-2'>
        <span className='rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground'>
          ลด {discountPercent}%
        </span>
        <span className='text-xs font-bold uppercase tracking-[0.22em] text-primary'>
          ดีลช่วงเวลาจำกัด
        </span>
      </div>
      <div
        className={`flex ${
          forListing && 'justify-center'
        } items-center gap-2`}
      >
        <div className={cn('text-3xl', className)}>
          <span className='align-super text-xs'>{symbol}</span>
          {integer}
          <span className='align-super text-xs'>.{fraction}</span>
        </div>
        <div className='py-2 text-xs text-muted-foreground'>
          จากราคา:{' '}
          <span className='line-through'>{formatCurrency(listPrice)}</span>
        </div>
      </div>
    </div>
  ) : (
    <div>
      <div className='flex justify-center gap-3'>
        <div className='text-3xl text-primary'>-{discountPercent}%</div>
        <div className={cn('text-3xl', className)}>
          <span className='align-super text-xs'>{symbol}</span>
          {integer}
          <span className='align-super text-xs'>.{fraction}</span>
        </div>
      </div>
      <div className='py-2 text-xs text-muted-foreground'>
        ราคาป้าย:{' '}
        <span className='line-through'>{formatCurrency(listPrice)}</span>
      </div>
    </div>
  )
}

export default ProductPrice
