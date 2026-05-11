import Link from 'next/link'
import { EllipsisVertical } from 'lucide-react'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { exploreLinks, policyLinks } from '@/lib/site-navigation'

import CartButton from './cart-button'
import ThemeSwitcher from './theme-switcher'
import UserButton from './user-button'

export default function Menu() {
  return (
    <div className='flex justify-end'>
      <nav className='hidden w-full gap-2 md:flex'>
        <ThemeSwitcher />
        <UserButton />
        <CartButton />
      </nav>
      <nav className='md:hidden'>
        <Sheet>
          <SheetTrigger className='header-button align-middle'>
            <EllipsisVertical className='h-6 w-6' />
          </SheetTrigger>
          <SheetContent className='flex flex-col items-start border-l border-border/60 bg-background/95 text-foreground backdrop-blur'>
            <SheetHeader className='w-full'>
              <div className='flex items-center justify-between'>
                <SheetTitle>เมนูเว็บไซต์</SheetTitle>
                <SheetDescription></SheetDescription>
              </div>
            </SheetHeader>
            <ThemeSwitcher />
            <UserButton />
            <CartButton />

            <div className='mt-4 w-full space-y-5 border-t border-border/60 pt-4'>
              <div className='space-y-2'>
                <p className='text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground'>
                  สำรวจ
                </p>
                <div className='flex flex-col gap-1'>
                  {exploreLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className='rounded-2xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted'
                      >
                        {link.name}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>

              <div className='space-y-2'>
                <p className='text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground'>
                  นโยบาย
                </p>
                <div className='flex flex-col gap-1'>
                  {policyLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className='rounded-2xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted'
                      >
                        {link.name}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}
