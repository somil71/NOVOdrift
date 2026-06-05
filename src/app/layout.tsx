import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/components/providers/QueryProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'FitBoard — Shoppable Outfit Discovery',
  description: 'Discover editorial outfits and shop every piece directly.',
  openGraph: {
    title: 'FitBoard',
    description: 'Discover editorial outfits and shop every piece directly.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-bg-primary text-text-primary antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
