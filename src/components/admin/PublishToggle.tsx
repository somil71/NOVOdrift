'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PublishToggleProps {
  fitId: string
  initialPublished: boolean
}

export default function PublishToggle({ fitId, initialPublished }: PublishToggleProps) {
  const router = useRouter()
  const [published, setPublished] = useState(initialPublished)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    const res = await fetch(`/api/fits/${fitId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !published }),
    })
    const json = await res.json()
    if (res.ok && !json.error) {
      setPublished(!published)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`font-label-caps text-label-caps uppercase tracking-widest px-lg py-sm rounded border transition-all duration-200 disabled:opacity-50 ${
        published
          ? 'bg-green-900/40 text-green-400 border-green-700 hover:bg-green-900/60'
          : 'bg-secondary text-on-secondary border-secondary hover:bg-secondary-fixed'
      }`}
    >
      {loading ? '...' : published ? '✓ Published' : 'Publish Fit'}
    </button>
  )
}
