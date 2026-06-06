'use client'

import { useEffect, useRef } from 'react'

interface ViewTrackerProps {
  type: 'fits' | 'products'
  id: string
}

/** Fires a single view-count increment when a detail page mounts. */
export default function ViewTracker({ type, id }: ViewTrackerProps) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    // sessionStorage de-dupe so refreshes within a session don't double-count
    const key = `viewed:${type}:${id}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    fetch('/api/track/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id }),
      keepalive: true,
    }).catch(() => {})
  }, [type, id])

  return null
}
