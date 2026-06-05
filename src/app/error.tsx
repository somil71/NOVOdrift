'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[Error Boundary]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-lg text-center">
      <span className="material-symbols-outlined text-[64px] text-on-surface-variant opacity-30 mb-lg">
        error_outline
      </span>
      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-sm">
        Something went wrong
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-xl">
        An unexpected error occurred. This has been logged and we&apos;ll look into it.
      </p>
      <div className="flex gap-md">
        <button
          onClick={reset}
          className="bg-secondary text-on-secondary font-label-caps text-label-caps uppercase px-lg py-sm rounded hover:bg-secondary-fixed transition-colors tracking-widest"
        >
          Try Again
        </button>
        <Link
          href="/fits"
          className="border border-outline-variant text-on-surface font-label-caps text-label-caps uppercase px-lg py-sm rounded hover:border-secondary hover:text-secondary transition-colors tracking-widest"
        >
          Go to Feed
        </Link>
      </div>
    </div>
  )
}
