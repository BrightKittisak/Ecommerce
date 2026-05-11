import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getAllCategories } from '@/lib/actions/product.actions'
import { APP_NAME } from '@/lib/constants'
import data from '@/lib/data'
import { exploreLinks, policyLinks } from '@/lib/site-navigation'

import Menu from './menu'
import Search from './search'
import Sidebar from './sidebar'

function HeaderDropdown({
  label,
  links,
}: {
  label: string
  links: readonly { name: string; href: string }[]
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='header-button flex items-center gap-1 !px-3 !py-1.5 text-[13px] text-muted-foreground hover:text-foreground sm:text-sm'>
          {label}
          <ChevronDown className='h-4 w-4' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='min-w-[14rem] rounded-2xl border-border/60 bg-popover/95 p-2 backdrop-blur'
      >
        {links.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <Link
              href={link.href}
              className='rounded-xl px-3 py-2 text-sm text-foreground'
            >
              {link.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default async function Header() {
  const categories = await getAllCategories()

  return (
    <header className='sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl'>
      <div className='bg-[linear-gradient(90deg,#18352c,#2f5a49,#b55b34)] text-white'>
        <div className='page-shell flex min-h-10 items-center justify-between gap-4 text-[13px] font-medium sm:text-sm'>
          <span>คัดของใช้จำเป็นให้ดูดีขึ้น ใช้ง่ายขึ้น และคุ้มทุกวัน</span>
          <span className='hidden md:block'>
            ชำระเงินได้ทั้ง PayPal, Stripe และเก็บเงินปลายทาง
          </span>
        </div>
      </div>

      <div className='page-shell py-4'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center'>
            <Link
              href='/'
              className='group flex items-center gap-3 rounded-full px-2 py-1'
            >
              <Image
                src='/icons/logo.svg'
                width={46}
                height={46}
                alt={`${APP_NAME} logo`}
                className='transition-transform duration-300 group-hover:rotate-6'
              />
              <div className='flex flex-col'>
                <span className='font-serif text-[1.65rem] font-semibold tracking-tight text-foreground sm:text-[1.8rem]'>
                  {APP_NAME}
                </span>
                <span className='text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground sm:text-[11px]'>
                  ช้อปง่าย ดูดีทุกธีม
                </span>
              </div>
            </Link>
          </div>
          <div className='hidden max-w-xl flex-1 md:block'>
            <Search />
          </div>
          <Menu />
        </div>
        <div className='block pt-3 md:hidden'>
          <Search />
        </div>
      </div>

      <div className='border-t border-border/60 bg-card/70'>
        <div className='page-shell flex items-center gap-4 overflow-hidden py-2'>
          <Sidebar categories={categories} />
          <div className='flex max-h-[42px] flex-wrap items-center gap-2 overflow-hidden'>
            {data.headerMenus.map((menu) => (
              <Link
                href={menu.href}
                key={menu.href}
                className='header-button !px-3 !py-1.5 text-[13px] text-muted-foreground hover:text-foreground sm:text-sm'
              >
                {menu.name}
              </Link>
            ))}
            <Link
              href='/page/customer-service'
              className='header-button !px-3 !py-1.5 text-[13px] text-muted-foreground hover:text-foreground sm:text-sm'
            >
              บริการลูกค้า
            </Link>
            <HeaderDropdown label='สำรวจ' links={exploreLinks} />
            <HeaderDropdown label='นโยบาย' links={policyLinks} />
          </div>
        </div>
      </div>
    </header>
  )
}
