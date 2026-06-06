'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin',          label: 'Dashboard',  icon: 'dashboard' },
  { href: '/admin/analytics',label: 'Analytics',  icon: 'monitoring' },
  { href: '/admin/fits',     label: 'Fits',       icon: 'style' },
  { href: '/admin/products', label: 'Products',   icon: 'shopping_bag' },
  { href: '/admin/settings', label: 'Settings',   icon: 'settings' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data: { user } }) => setEmail(user?.email ?? ''))
  }, [])

  // Close the mobile drawer whenever the route changes
  useEffect(() => { setOpen(false) }, [pathname])

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const panel = (
    <>
      {/* Brand */}
      <div className="px-lg py-lg border-b border-outline-variant/60">
        <Link href="/fits" className="font-headline-sm text-headline-sm font-bold text-on-surface hover:text-secondary transition-colors tracking-[2px]">
          FITBOARD
        </Link>
        <p className="font-label-caps text-label-caps text-on-surface-variant mt-base uppercase tracking-widest">Admin Console</p>
      </div>

      {/* Nav */}
      <div className="px-md pt-lg">
        <p className="px-3 mb-xs font-label-caps text-[10px] text-on-surface-variant/50 uppercase tracking-[2px]">Manage</p>
        <ul className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon }) => {
            const active = isActive(href)
            return (
              <li key={href}>
                <Link href={href}
                  className={active
                    ? 'relative flex items-center gap-sm text-secondary bg-secondary/10 rounded-lg pl-3 pr-3 py-2.5 font-medium'
                    : 'flex items-center gap-sm text-on-surface-variant rounded-lg pl-3 pr-3 py-2.5 hover:bg-surface-container-high hover:text-on-surface transition-colors'}>
                  {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r bg-secondary" />}
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
                  <span className="font-body-md text-body-md">{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Quick action */}
      <div className="px-md mt-lg">
        <Link href="/admin/fits/new"
          className="flex items-center justify-center gap-xs bg-secondary text-on-secondary font-label-caps text-label-caps uppercase tracking-widest py-2.5 rounded-lg hover:bg-secondary-fixed transition-colors">
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Fit
        </Link>
      </div>

      {/* User + logout */}
      <div className="mt-auto border-t border-outline-variant/60 p-md">
        <div className="flex items-center gap-sm mb-sm px-1">
          <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">person</span>
          </div>
          <div className="min-w-0">
            <p className="font-body-sm text-body-sm text-on-surface truncate">{email || 'Admin'}</p>
            <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">Administrator</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-sm text-on-surface-variant rounded-lg px-3 py-2 hover:bg-surface-container-high hover:text-error transition-colors">
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span className="font-body-sm text-body-sm">Log out</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-4">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-on-surface p-1">
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <span className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-[2px]">FITBOARD</span>
        <Link href="/admin/fits/new" aria-label="New fit" className="text-secondary p-1">
          <span className="material-symbols-outlined text-[24px]">add</span>
        </Link>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <nav className="absolute left-0 top-0 h-full w-[260px] bg-surface-container-lowest border-r border-outline-variant flex flex-col animate-[slideIn_0.2s_ease]">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute top-3 right-3 text-on-surface-variant z-10">
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
            {panel}
          </nav>
          <style>{`@keyframes slideIn { from { transform: translateX(-100%) } to { transform: translateX(0) } }`}</style>
        </div>
      )}

      {/* Desktop fixed sidebar */}
      <nav className="hidden md:flex flex-col bg-surface-container-lowest fixed left-0 top-0 h-screen w-[240px] border-r border-outline-variant z-50">
        {panel}
      </nav>
    </>
  )
}
