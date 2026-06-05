'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

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
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-accent-gold">FitBoard</h1>
          <p className="text-text-muted text-sm mt-1">Admin access only</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-bg-card border border-border rounded-card p-6 flex flex-col gap-4"
        >
          <Input
            id="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
            autoComplete="email"
          />
          <Input
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-button px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="w-full mt-2">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  )
}
