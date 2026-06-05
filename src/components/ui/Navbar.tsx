'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function Navbar() {
  const [isUser, setIsUser] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data: { user } }) => setIsUser(!!user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsUser(!!session?.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
      <nav className="flex justify-between items-center h-16 px-lg max-w-7xl mx-auto">
        <Link
          href="/fits"
          className="font-headline-sm text-headline-sm tracking-[3px] text-on-surface hover:text-secondary transition-colors duration-200 uppercase"
        >
          FITBOARD
        </Link>

        <div className="hidden md:flex items-center gap-lg">
          <Link href="/search/fits" className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors duration-200">
            Search Fits
          </Link>
          <Link href="/search/products" className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors duration-200">
            Shop Products
          </Link>
        </div>

        <div className="flex items-center gap-md">
          <Link href="/search/fits" className="text-on-surface-variant hover:text-secondary transition-colors duration-200 md:hidden" aria-label="Search">
            <span className="material-symbols-outlined text-[22px]">search</span>
          </Link>
          {isUser ? (
            <Link href="/profile" className="text-on-surface-variant hover:text-secondary transition-colors duration-200" aria-label="My Profile">
              <span className="material-symbols-outlined text-[22px]">account_circle</span>
            </Link>
          ) : (
            <Link
              href="/auth"
              className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
