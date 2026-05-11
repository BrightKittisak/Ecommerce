'use client'

import { ShoppingCartIcon } from 'lucide-react'
import Link from 'next/link'

import useCartSidebar from '@/hooks/use-cart-sidebar'
import useCartStore from '@/hooks/use-cart-store'
import useIsMounted from '@/hooks/use-is-mounted'
import { cn } from '@/lib/utils'

export default function CartButton() {
  const isMounted = useIsMounted()
  const {
    cart: { items },
  } = useCartStore()
  const cartItemsCount = items.reduce((a, c) => a + c.quantity, 0)
  const isCartSidebarOpen = useCartSidebar()

  return (
    <Link href='/cart' className='header-button px-3'>
      <div className='relative flex items-end gap-1 text-xs'>
        <ShoppingCartIcon className='h-8 w-8' />

        {isMounted && (
          <span
            className={cn(
              'absolute right-[28px] top-[-4px] z-10 rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground',
              cartItemsCount >= 10 && 'px-1 text-[11px]'
            )}
          >
            {cartItemsCount}
          </span>
        )}
        <span className='font-bold text-foreground'>ตะกร้า</span>
        {isCartSidebarOpen && (
          <div className='absolute right-[-16px] top-[20px] z-10 h-0 w-0 rotate-[-90deg] border-b-[8px] border-l-[7px] border-r-[7px] border-b-background border-l-transparent border-r-transparent'></div>
        )}
      </div>
    </Link>
  )
}
