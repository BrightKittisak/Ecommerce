'use client'

import { SessionProvider } from 'next-auth/react'
import React from 'react'
import { Toaster } from 'sonner'

import useCartSidebar from '@/hooks/use-cart-sidebar'

import CartSidebar from './cart-sidebar'
import { ThemeProvider } from './theme-provider'

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  const isCartSidebarOpen = useCartSidebar()

  return (
    <SessionProvider>
      <ThemeProvider
        attribute='class'
        defaultTheme='system'
        enableSystem
        disableTransitionOnChange
      >
        {isCartSidebarOpen ? (
          <div className='flex min-h-screen'>
            <div className='flex-1 overflow-hidden'>{children}</div>
            <CartSidebar />
          </div>
        ) : (
          <div>{children}</div>
        )}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}
