import { EllipsisVertical } from 'lucide-react'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

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
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}
