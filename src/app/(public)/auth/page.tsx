'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }
    router.push(next)
    router.refresh()
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) { setError('Please agree to the Terms of Service'); return }
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    })
    if (authError) { setError(authError.message); setLoading(false); return }
    setSuccess('Check your email to confirm your account.')
    setLoading(false)
  }

  const inputClass = 'w-full bg-surface-container-low border border-outline-variant rounded px-md py-sm font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-tertiary focus:ring-1 focus:ring-tertiary focus:outline-none transition-all'
  const labelClass = 'font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest'

  return (
    <div className="bg-background text-on-surface min-h-screen w-full flex overflow-hidden selection:bg-secondary selection:text-on-secondary">
      {/* Left — editorial */}
      <div className="hidden md:block w-1/2 h-screen relative sticky top-0">
        <div className="absolute inset-0 bg-background/20 z-10 mix-blend-multiply" />
        <Image
          src="/images/auth-bg.jpg"
          alt="FITBOARD"
          fill
          className="object-cover filter contrast-125 saturate-50"
          priority
        />
        <div className="absolute bottom-huge left-xl z-20">
          <h1 className="font-display text-display text-on-surface mb-xs tracking-tight">FITBOARD</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
            Curate your aesthetic. Discover the cutting edge of digital fashion expression.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full md:w-1/2 min-h-screen bg-background flex flex-col justify-center items-center p-lg">
        <div className="md:hidden mb-xl text-center">
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">FITBOARD</h1>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Tabs */}
          <div className="flex border-b border-outline-variant mb-xl">
            {(['signin', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess('') }}
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
            <div className="mb-lg font-body-sm text-body-sm text-error bg-error-container/30 border border-error/30 rounded px-md py-sm">
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
                <label className={labelClass} htmlFor="signin-email">Email Address</label>
                <input id="signin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" required className={inputClass} autoComplete="email" />
              </div>
              <div className="flex flex-col gap-xs">
                <div className="flex justify-between items-center">
                  <label className={labelClass} htmlFor="signin-password">Password</label>
                </div>
                <input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" required className={inputClass} autoComplete="current-password" />
              </div>
              <div className="pt-sm flex flex-col gap-md">
                <button type="submit" disabled={loading}
                  className="w-full bg-secondary text-on-secondary font-headline-sm text-headline-sm py-sm rounded hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-xs disabled:opacity-50">
                  {loading ? 'Signing in...' : 'Sign In'}
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
                </button>
                <div className="relative flex items-center py-xs">
                  <div className="flex-grow border-t border-outline-variant" />
                  <span className="flex-shrink-0 mx-md font-label-caps text-label-caps text-outline uppercase">Or</span>
                  <div className="flex-grow border-t border-outline-variant" />
                </div>
                <button type="button" onClick={() => setTab('signup')}
                  className="w-full bg-transparent border border-outline text-on-surface font-headline-sm text-headline-sm py-sm rounded hover:bg-surface-container-high transition-colors flex justify-center items-center gap-sm">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* Sign Up */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="flex flex-col gap-lg">
              <div className="flex flex-col gap-xs">
                <label className={labelClass} htmlFor="signup-name">Full Name</label>
                <input id="signup-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name" required className={inputClass} autoComplete="name" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className={labelClass} htmlFor="signup-email">Email Address</label>
                <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" required className={inputClass} autoComplete="email" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className={labelClass} htmlFor="signup-password">Password</label>
                <input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min. 8 chars)" required minLength={8} className={inputClass} autoComplete="new-password" />
              </div>
              <div className="flex items-start gap-sm pt-xs">
                <input id="terms" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded-sm bg-surface-container-lowest border-outline-variant accent-secondary" />
                <label htmlFor="terms" className="font-body-sm text-body-sm text-on-surface-variant">
                  I agree to the{' '}
                  <a href="/terms" className="text-on-surface underline hover:text-secondary transition-colors">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-on-surface underline hover:text-secondary transition-colors">Privacy Policy</a>.
                </label>
              </div>
              <div className="pt-sm">
                <button type="submit" disabled={loading}
                  className="w-full bg-secondary text-on-secondary font-headline-sm text-headline-sm py-sm rounded hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-xs disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create Account'}
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
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
