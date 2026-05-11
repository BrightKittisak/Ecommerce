'use client'

import { ChevronDownIcon, Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import useIsMounted from '@/hooks/use-is-mounted'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const isMounted = useIsMounted()
  const activeTheme = isMounted ? theme : 'system'

  const themeLabel =
    activeTheme === 'dark'
      ? 'โหมดกลางคืน'
      : activeTheme === 'light'
        ? 'โหมดสว่าง'
        : 'อัตโนมัติ'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='header-button h-[41px]'>
        {activeTheme === 'dark' ? (
          <div className='flex items-center gap-1.5'>
            <Moon className='h-4 w-4' />
            {themeLabel}
            <ChevronDownIcon />
          </div>
        ) : activeTheme === 'light' ? (
          <div className='flex items-center gap-1.5'>
            <Sun className='h-4 w-4' />
            {themeLabel}
            <ChevronDownIcon />
          </div>
        ) : (
          <div className='flex items-center gap-1.5'>
            <Laptop className='h-4 w-4' />
            {themeLabel}
            <ChevronDownIcon />
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>ธีมการแสดงผล</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={activeTheme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value='system'>
            <Laptop className='mr-2 h-4 w-4' /> อัตโนมัติตามอุปกรณ์
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='dark'>
            <Moon className='mr-2 h-4 w-4' /> โหมดกลางคืน
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='light'>
            <Sun className='mr-2 h-4 w-4' /> โหมดสว่าง
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <p className='px-2 py-1 text-xs text-muted-foreground'>
          สลับธีมได้ทันทีทั้งเว็บและระบบจะจดจำค่าที่เลือกไว้ให้
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
