'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin',          label: 'Dashboard',         icon: 'dashboard' },
  { href: '/admin/fits',     label: 'Fits Manager',      icon: 'style' },
  { href: '/admin/products', label: 'Products Manager',  icon: 'shopping_bag' },
  { href: '/admin/settings', label: 'Settings',          icon: 'settings' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <nav className="hidden md:flex flex-col py-lg bg-surface-container-lowest fixed left-0 top-0 h-screen w-[240px] border-r border-outline-variant z-50">
      <div className="px-lg mb-xl">
        <Link href="/fits" className="font-headline-sm text-headline-sm font-bold text-on-surface hover:text-secondary transition-colors">
          FITBOARD
        </Link>
        <p className="font-label-caps text-label-caps text-on-surface-variant mt-base">Admin Console</p>
      </div>

      <ul className="flex flex-col flex-grow">
        {navItems.map(({ href, label, icon }) => {
          const active = isActive(href)
          return (
            <li key={href}>
              <Link
                href={href}
                className={
                  active
                    ? 'flex items-center gap-sm text-secondary border-l-2 border-secondary bg-surface-container-low pl-4 py-3'
                    : 'flex items-center gap-sm text-on-surface-variant pl-4 py-3 hover:bg-surface-container-high hover:text-on-surface transition-all cursor-pointer'
                }
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {icon}
                </span>
                <span className="font-label-caps text-label-caps uppercase">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-sm text-on-surface-variant pl-4 py-3 hover:bg-surface-container-high hover:text-on-surface transition-all w-full cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="font-label-caps text-label-caps uppercase">Logout</span>
        </button>
      </div>
    </nav>
  )
}
