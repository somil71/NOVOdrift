'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    router.push('/admin/fits')
    router.refresh()
  }

  return (
    <div className="bg-background text-on-surface min-h-screen w-full flex overflow-hidden selection:bg-secondary selection:text-on-secondary">
      {/* Left Column: Editorial Graphic */}
      <div className="hidden md:flex md:w-1/2 relative items-center justify-center bg-surface-container-lowest overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: "url('/images/admin-login-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/20" />
        <div className="relative z-10 text-center px-xl">
          <h1 className="font-display text-display tracking-[0.2em] text-on-surface uppercase drop-shadow-2xl">
            FITBOARD
          </h1>
          <p className="mt-lg font-label-caps text-label-caps text-secondary tracking-widest uppercase">
            Curated Style Intelligence
          </p>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-lg relative z-20">
        {/* Mobile background fallback */}
        <div
          className="md:hidden absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/images/admin-login-bg.jpg')" }}
        />

        <div className="w-full max-w-[400px] bg-surface-container-low border border-outline-variant p-xl sm:p-xxl rounded shadow-2xl relative z-10 backdrop-blur-md">
          <div className="mb-xl text-center md:text-left">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">Admin Access</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Secure portal for authorized personnel.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-lg">
            <div className="flex flex-col gap-xs">
              <label htmlFor="email" className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                Corporate Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fitboard.com"
                required
                autoComplete="email"
                className="w-full bg-surface-container border border-outline-variant rounded px-md py-sm font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label htmlFor="password" className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-surface-container border border-outline-variant rounded px-md py-sm font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
              />
            </div>

            {error && (
              <p className="font-body-sm text-body-sm text-error bg-error-container/30 border border-error/30 rounded px-md py-sm">
                {error}
              </p>
            )}

            <div className="pt-sm">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary text-on-secondary hover:bg-secondary-fixed hover:shadow-[0_0_15px_rgba(233,193,105,0.3)] transition-all duration-300 rounded py-sm px-lg font-label-caps text-label-caps uppercase tracking-wider flex items-center justify-center gap-sm disabled:opacity-50"
              >
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  arrow_forward
                </span>
              </button>
            </div>
          </form>

          <div className="mt-xxl flex items-center justify-center gap-xs text-on-surface-variant/50">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span className="font-label-caps text-label-caps uppercase text-[10px] tracking-widest">
              End-to-End Encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
