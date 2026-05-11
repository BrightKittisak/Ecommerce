import type { Metadata } from 'next'
import { Bai_Jamjuree, Noto_Sans_Thai } from 'next/font/google'
import './globals.css'

import ClientProviders from '@/components/shared/client-providers'
import { APP_DESCRIPTION, APP_NAME, APP_SLOGAN } from '@/lib/constants'

const notoSansThai = Noto_Sans_Thai({
  variable: '--font-body',
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const baiJamjuree = Bai_Jamjuree({
  variable: '--font-display',
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: `${APP_NAME}. ${APP_SLOGAN}`,
  },
  description: APP_DESCRIPTION,
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='th' suppressHydrationWarning>
      <body
        className={`${notoSansThai.variable} ${baiJamjuree.variable} antialiased`}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
