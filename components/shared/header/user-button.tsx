import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

import { auth } from '@/auth'
import { SignOut } from '@/lib/actions/user.actions'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default async function UserButton() {
  const session = await auth()

  return (
    <div className='flex items-center gap-2'>
      <DropdownMenu>
        <DropdownMenuTrigger className='header-button' asChild>
          <div className='flex items-center gap-2'>
            <div className='flex flex-col text-left text-xs'>
              <span className='text-muted-foreground'>
                สวัสดี, {session ? session.user.name : 'เข้าสู่ระบบ'}
              </span>
              <span className='font-bold text-foreground'>บัญชีและคำสั่งซื้อ</span>
            </div>
            <ChevronDown />
          </div>
        </DropdownMenuTrigger>
        {session ? (
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm font-medium leading-none'>
                  {session.user.name}
                </p>
                <p className='text-xs leading-none text-muted-foreground'>
                  {session.user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <Link className='w-full' href='/account'>
                <DropdownMenuItem>บัญชีของคุณ</DropdownMenuItem>
              </Link>
              <Link className='w-full' href='/account/orders'>
                <DropdownMenuItem>คำสั่งซื้อของคุณ</DropdownMenuItem>
              </Link>

              {session.user.role === 'Admin' && (
                <Link className='w-full' href='/admin/overview'>
                  <DropdownMenuItem>ผู้ดูแลระบบ</DropdownMenuItem>
                </Link>
              )}
            </DropdownMenuGroup>
            <DropdownMenuItem className='mb-1 p-0'>
              <form action={SignOut} className='w-full'>
                <Button
                  className='h-4 w-full justify-start px-2 py-4'
                  variant='ghost'
                >
                  ออกจากระบบ
                </Button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        ) : (
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link
                  className={cn(buttonVariants(), 'w-full')}
                  href='/sign-in'
                >
                  เข้าสู่ระบบ
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuLabel>
              <div className='font-normal'>
                ลูกค้าใหม่? <Link href='/sign-up'>สมัครสมาชิก</Link>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  )
}
