import Link from 'next/link'
import { ChevronRight, MenuIcon, UserCircle, X } from 'lucide-react'

import { auth } from '@/auth'
import { SignOut } from '@/lib/actions/user.actions'
import { translateCategory } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

export default async function Sidebar({
  categories,
}: {
  categories: string[]
}) {
  const session = await auth()

  return (
    <Drawer direction='left'>
      <DrawerTrigger className='header-button flex items-center !p-2'>
        <MenuIcon className='mr-1 h-5 w-5' />
        ทั้งหมด
      </DrawerTrigger>
      <DrawerContent className='top-0 mt-0 w-[350px] border-r border-border/70 bg-background'>
        <div className='flex h-full flex-col'>
          <div className='flex items-center justify-between bg-foreground text-background'>
            <DrawerHeader>
              <DrawerTitle className='flex items-center'>
                <UserCircle className='mr-2 h-6 w-6' />
                {session ? (
                  <DrawerClose asChild>
                    <Link href='/account'>
                      <span className='text-lg font-semibold'>
                        สวัสดี, {session.user.name}
                      </span>
                    </Link>
                  </DrawerClose>
                ) : (
                  <DrawerClose asChild>
                    <Link href='/sign-in'>
                      <span className='text-lg font-semibold'>สวัสดี, เข้าสู่ระบบ</span>
                    </Link>
                  </DrawerClose>
                )}
              </DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <DrawerClose asChild>
              <Button variant='ghost' size='icon' className='mr-2 text-background hover:bg-white/10 hover:text-background'>
                <X className='h-5 w-5' />
                <span className='sr-only'>Close</span>
              </Button>
            </DrawerClose>
          </div>

          <div className='flex-1 overflow-y-auto'>
            <div className='border-b p-4'>
              <h2 className='font-serif text-2xl font-semibold'>
                เลือกช้อปตามหมวด
              </h2>
            </div>
            <nav className='flex flex-col'>
              {categories.map((category) => (
                <DrawerClose asChild key={category}>
                  <Link
                    href={`/search?category=${category}`}
                    className='item-button flex items-center justify-between'
                  >
                    <span>{translateCategory(category)}</span>
                    <ChevronRight className='h-4 w-4' />
                  </Link>
                </DrawerClose>
              ))}
            </nav>
          </div>

          <div className='flex flex-col border-t'>
            <div className='p-4'>
              <h2 className='font-serif text-2xl font-semibold'>
                ช่วยเหลือและการตั้งค่า
              </h2>
            </div>
            <DrawerClose asChild>
              <Link href='/account' className='item-button'>
                บัญชีของคุณ
              </Link>
            </DrawerClose>
            <DrawerClose asChild>
              <Link href='/page/customer-service' className='item-button'>
                บริการลูกค้า
              </Link>
            </DrawerClose>
            {session ? (
              <form action={SignOut} className='w-full'>
                <Button
                  className='item-button w-full justify-start text-base'
                  variant='ghost'
                >
                  ออกจากระบบ
                </Button>
              </form>
            ) : (
              <Link href='/sign-in' className='item-button'>
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
