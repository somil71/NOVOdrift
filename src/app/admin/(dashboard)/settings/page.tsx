'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useToast, ToastContainer } from '@/components/ui/Toast'

export default function AdminSettingsPage() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data: { user } }) => setEmail(user?.email ?? ''))
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)
    if (error) toast.error(error.message)
    else { toast.success('Password updated'); setNewPassword(''); setConfirmPassword('') }
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-on-surface mb-1">Settings</h1>
      <p className="text-on-surface-variant text-sm mb-8">Manage your account and platform configuration.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account */}
        <section className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
          <div className="flex items-center gap-sm mb-4">
            <span className="material-symbols-outlined text-secondary text-[20px]">account_circle</span>
            <h2 className="text-lg font-semibold text-on-surface">Account</h2>
          </div>
          <div className="flex flex-col gap-1 mb-4">
            <label className="text-[13px] font-medium text-on-surface-variant">Email</label>
            <div className="bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface-variant text-sm">
              {email || '—'}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] text-green-400">verified</span>
            Administrator · full access
          </div>
        </section>

        {/* Change password */}
        <section className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
          <div className="flex items-center gap-sm mb-4">
            <span className="material-symbols-outlined text-secondary text-[20px]">lock</span>
            <h2 className="text-lg font-semibold text-on-surface">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            <Input id="new-password" type="password" label="New Password" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" required autoComplete="new-password" />
            <Input id="confirm-password" type="password" label="Confirm Password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" required autoComplete="new-password" />
            <Button type="submit" loading={loading} className="w-fit">Update Password</Button>
          </form>
        </section>

        {/* Quick links */}
        <section className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
          <div className="flex items-center gap-sm mb-4">
            <span className="material-symbols-outlined text-secondary text-[20px]">bolt</span>
            <h2 className="text-lg font-semibold text-on-surface">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/admin/fits/new', label: 'New Fit', icon: 'add_photo_alternate' },
              { href: '/admin/products/new', label: 'New Product', icon: 'add_shopping_cart' },
              { href: '/admin/fits', label: 'Manage Fits', icon: 'style' },
              { href: '/admin/products', label: 'Manage Products', icon: 'shopping_bag' },
            ].map(({ href, label, icon }) => (
              <Link key={href} href={href}
                className="flex flex-col items-center gap-2 bg-surface-container border border-outline-variant rounded-lg py-4 hover:border-secondary hover:text-secondary text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[22px]">{icon}</span>
                <span className="text-xs font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Platform info */}
        <section className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
          <div className="flex items-center gap-sm mb-4">
            <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
            <h2 className="text-lg font-semibold text-on-surface">Platform</h2>
          </div>
          <dl className="flex flex-col gap-3 text-sm">
            {[
              ['Storefront', <Link key="s" href="/fits" target="_blank" className="text-secondary hover:underline">View live site →</Link>],
              ['Stack', <span key="st" className="text-on-surface-variant">Next.js 14 · Supabase</span>],
              ['Affiliate model', <span key="a" className="text-on-surface-variant">Commission on click-through</span>],
            ].map(([k, v], i) => (
              <div key={i} className="flex justify-between items-center border-b border-outline-variant/50 pb-2 last:border-0">
                <dt className="text-on-surface-variant">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
    </div>
  )
}
