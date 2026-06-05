'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type Tab = 'signin' | 'signup'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/fits'

  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createSupabaseBrowserClient()

  const reset = () => { setError(''); setSuccess('') }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); reset(); setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push(next); router.refresh()
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) { setError('Please agree to the Terms of Service'); return }
    reset(); setLoading(true)
    const { error: err } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    })
    if (err) { setError(err.message); setLoading(false); return }
    setSuccess('Check your email to confirm your account.')
    setLoading(false)
  }

  const inputClass =
    'w-full bg-surface-container-low border border-outline-variant rounded px-md py-sm ' +
    'font-body-md text-body-md text-on-surface placeholder:text-outline ' +
    'focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-colors'

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-lg">
      {/* Logo */}
      <div className="mb-xxl text-center">
        <h1 className="font-headline-sm text-headline-sm tracking-[3px] text-on-surface uppercase">
          FITBOARD
        </h1>
        <p className="font-label-caps text-label-caps text-on-surface-variant mt-xs uppercase tracking-widest">
          Curated Style Intelligence
        </p>
      </div>

      <div className="w-full max-w-[420px] bg-surface-container-low border border-outline-variant rounded p-xl shadow-2xl">
        {/* Tabs */}
        <div className="flex border-b border-outline-variant mb-xl">
          {(['signin', 'signup'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); reset() }}
              className={`flex-1 pb-sm font-headline-sm text-headline-sm transition-colors border-b-2 ${
                tab === t
                  ? 'text-on-surface border-secondary'
                  : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              {t === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-lg font-body-sm text-body-sm text-error bg-error-container/20 border border-error/30 rounded px-md py-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-lg font-body-sm text-body-sm text-green-400 bg-green-900/20 border border-green-700/30 rounded px-md py-sm">
            {success}
          </div>
        )}

        {/* Sign In */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="flex flex-col gap-lg">
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest" htmlFor="email">
                Email Address
              </label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" required autoComplete="email" className={inputClass} />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest" htmlFor="password">
                Password
              </label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password" required autoComplete="current-password" className={inputClass} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-secondary text-on-secondary font-headline-sm text-headline-sm py-sm rounded hover:bg-secondary-fixed active:scale-[0.98] transition-all flex justify-center items-center gap-xs disabled:opacity-50 mt-xs">
              {loading ? 'Signing in…' : 'Sign In'}
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
            </button>
          </form>
        )}

        {/* Sign Up */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} className="flex flex-col gap-lg">
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest" htmlFor="name">
                Full Name
              </label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name" required autoComplete="name" className={inputClass} />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest" htmlFor="signup-email">
                Email Address
              </label>
              <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" required autoComplete="email" className={inputClass} />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest" htmlFor="signup-password">
                Password
              </label>
              <input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters" required minLength={8} autoComplete="new-password" className={inputClass} />
            </div>
            <div className="flex items-start gap-sm">
              <input id="terms" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 accent-secondary" />
              <label htmlFor="terms" className="font-body-sm text-body-sm text-on-surface-variant">
                I agree to the{' '}
                <a href="/terms" className="text-on-surface underline hover:text-secondary transition-colors">Terms</a>
                {' & '}
                <a href="/privacy" className="text-on-surface underline hover:text-secondary transition-colors">Privacy Policy</a>
              </label>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-secondary text-on-secondary font-headline-sm text-headline-sm py-sm rounded hover:bg-secondary-fixed active:scale-[0.98] transition-all flex justify-center items-center gap-xs disabled:opacity-50">
              {loading ? 'Creating…' : 'Create Account'}
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
            </button>
          </form>
        )}
      </div>

      <p className="mt-lg font-body-sm text-body-sm text-on-surface-variant">
        <a href="/fits" className="hover:text-on-surface transition-colors">← Back to feed</a>
      </p>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}
