'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface SaveButtonProps {
  fitId: string
}

export default function SaveButton({ fitId }: SaveButtonProps) {
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Check if already saved (only if user is logged in)
    const check = async () => {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setChecked(true); return }

      const res = await fetch('/api/user/wishlist')
      if (res.ok) {
        const json = await res.json()
        setSaved((json.data ?? []).some((w: { fit_id: string }) => w.fit_id === fitId))
      }
      setChecked(true)
    }
    check()
  }, [fitId])

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/auth?next=/fits/${fitId}`)
      return
    }

    setLoading(true)
    try {
      if (saved) {
        await fetch(`/api/user/wishlist/${fitId}`, { method: 'DELETE' })
        setSaved(false)
      } else {
        await fetch('/api/user/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fit_id: fitId }),
        })
        setSaved(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!checked) return null

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? 'Remove from saved' : 'Save fit'}
      className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center
        bg-background/60 backdrop-blur-sm border border-outline-variant
        hover:bg-surface-container hover:border-secondary transition-all duration-200"
    >
      <span
        className="material-symbols-outlined text-[18px] transition-colors duration-200"
        style={{
          fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0",
          color: saved ? '#e9c169' : '#c4c7c7',
        }}
      >
        bookmark
      </span>
    </button>
  )
}
