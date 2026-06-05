'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, Package, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin/fits', label: 'Fits', icon: LayoutGrid },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-bg-card border-r border-border flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-border">
        <Link href="/fits" className="text-lg font-bold text-accent-gold">
          FitBoard
        </Link>
        <p className="text-xs text-text-muted mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium transition-colors mb-1',
              pathname.startsWith(href)
                ? 'bg-accent-gold/10 text-accent-gold'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-surface'
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium
            text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors w-full"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </aside>
  )
}
