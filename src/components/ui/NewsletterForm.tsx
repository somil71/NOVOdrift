'use client'

import { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    // Placeholder — wire to email service in production
    setJoined(true)
  }

  if (joined) {
    return (
      <p className="font-body-sm text-body-sm text-secondary">
        ✓ You&apos;re on the list!
      </p>
    )
  }

  return (
    <form onSubmit={handleJoin} className="flex gap-xs">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 min-w-0 bg-surface-container border border-outline-variant rounded px-md py-xs font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary transition-colors"
        required
      />
      <button
        type="submit"
        className="bg-secondary text-on-secondary font-label-caps text-label-caps uppercase px-md py-xs rounded hover:bg-secondary-fixed transition-colors tracking-widest flex-shrink-0"
      >
        Join
      </button>
    </form>
  )
}
