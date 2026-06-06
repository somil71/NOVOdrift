'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function Navbar() {
  const router = useRouter()
  const [isUser, setIsUser] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data: { user } }) => setIsUser(!!user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsUser(!!session?.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const signOut = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/fits')
    router.refresh()
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
      <nav className="flex justify-between items-center h-16 px-4 sm:px-lg max-w-7xl mx-auto">
        {/* Mobile hamburger */}
        <button onClick={() => setNavOpen((o) => !o)} aria-label="Menu" className="md:hidden text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined text-[24px]">{navOpen ? 'close' : 'menu'}</span>
        </button>

        <Link
          href="/fits"
          className="font-headline-sm text-headline-sm tracking-[3px] text-on-surface hover:text-secondary transition-colors duration-200 uppercase md:flex-none absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
        >
          FITBOARD
        </Link>

        <div className="hidden md:flex items-center gap-lg">
          <Link href="/fits" className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors duration-200">Feed</Link>
          <Link href="/search/fits" className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors duration-200">Search Fits</Link>
          <Link href="/search/products" className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors duration-200">Shop Products</Link>
        </div>

        <div className="flex items-center gap-md">

          {isUser ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="text-on-surface-variant hover:text-secondary transition-colors duration-200 flex items-center"
                aria-label="Account menu"
              >
                <span className="material-symbols-outlined text-[24px]">account_circle</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-sm w-48 bg-surface-container border border-outline-variant rounded-lg shadow-xl py-xs overflow-hidden">
                  {[
                    { href: '/profile', label: 'Saved Fits', icon: 'bookmark' },
                    { href: '/account', label: 'Account Settings', icon: 'settings' },
                  ].map(({ href, label, icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-sm px-md py-sm font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">{icon}</span>
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-sm px-md py-sm font-body-sm text-body-sm text-error hover:bg-surface-container-high transition-colors border-t border-outline-variant mt-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
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

      {/* Mobile nav drawer */}
      {navOpen && (
        <div className="md:hidden border-t border-outline-variant bg-surface/95 backdrop-blur-md">
          <div className="flex flex-col px-4 py-2">
            {[
              { href: '/fits', label: 'Feed' },
              { href: '/search/fits', label: 'Search Fits' },
              { href: '/search/products', label: 'Shop Products' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setNavOpen(false)}
                className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface py-3 border-b border-outline-variant/50 last:border-0 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
