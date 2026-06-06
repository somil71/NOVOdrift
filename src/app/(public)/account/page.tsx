'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export default function AccountPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth?next=/account')
        return
      }
      setEmail(user.email ?? '')
      setName((user.user_metadata?.full_name as string) ?? '')
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setMessage('')
    const supabase = createSupabaseBrowserClient()
    const { error: err } = await supabase.auth.updateUser({ data: { full_name: name } })
    if (err) setError(err.message)
    else { setMessage('Profile updated'); router.refresh() }
    setSaving(false)
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    setSaving(true); setError(''); setMessage('')
    const supabase = createSupabaseBrowserClient()
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    if (err) setError(err.message)
    else { setMessage('Password changed'); setNewPassword('') }
    setSaving(false)
  }

  const signOut = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/fits')
    router.refresh()
  }

  if (loading) {
    return (
      <main className="max-w-xl mx-auto px-lg py-xxl pt-[120px]">
        <div className="skeleton h-8 w-48 mb-lg" />
        <div className="skeleton h-32 w-full" />
      </main>
    )
  }

  const inputClass =
    'w-full bg-surface-container border border-outline-variant rounded px-md py-sm font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors'
  const labelClass = 'font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest'

  return (
    <main className="max-w-xl mx-auto px-lg py-xxl pt-[120px]">
      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Account Settings</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mb-xl">{email}</p>

      {message && (
        <div className="mb-lg font-body-sm text-body-sm text-green-400 bg-green-900/20 border border-green-700/30 rounded px-md py-sm">{message}</div>
      )}
      {error && (
        <div className="mb-lg font-body-sm text-body-sm text-error bg-error-container/20 border border-error/30 rounded px-md py-sm">{error}</div>
      )}

      {/* Profile */}
      <section className="bg-surface-container-low border border-outline-variant rounded-xl p-lg mb-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md">Profile</h2>
        <form onSubmit={saveName} className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <label className={labelClass} htmlFor="name">Display Name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClass} />
          </div>
          <button type="submit" disabled={saving} className="self-start bg-secondary text-on-secondary font-label-caps text-label-caps uppercase px-lg py-sm rounded hover:bg-secondary-fixed transition-colors tracking-widest disabled:opacity-50">
            Save
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="bg-surface-container-low border border-outline-variant rounded-xl p-lg mb-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md">Change Password</h2>
        <form onSubmit={changePassword} className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <label className={labelClass} htmlFor="pw">New Password</label>
            <input id="pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" className={inputClass} />
          </div>
          <button type="submit" disabled={saving} className="self-start bg-secondary text-on-secondary font-label-caps text-label-caps uppercase px-lg py-sm rounded hover:bg-secondary-fixed transition-colors tracking-widest disabled:opacity-50">
            Update Password
          </button>
        </form>
      </section>

      {/* Links + sign out */}
      <section className="flex items-center justify-between border-t border-outline-variant pt-lg">
        <div className="flex gap-lg">
          <Link href="/profile" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">Saved Fits</Link>
          <Link href="/privacy" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">Privacy</Link>
          <Link href="/terms" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">Terms</Link>
        </div>
        <button onClick={signOut} className="font-label-caps text-label-caps uppercase text-error hover:opacity-80 transition-opacity tracking-widest">
          Sign Out
        </button>
      </section>
    </main>
  )
}
