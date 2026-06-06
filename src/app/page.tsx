import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="relative min-h-screen bg-background overflow-hidden flex flex-col">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-160px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(232,192,104,0.10), transparent 70%)' }} />
        <div className="absolute bottom-[-120px] right-[-80px] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(232,192,104,0.06), transparent 70%)' }} />
      </div>

      {/* Top brand bar */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <span className="font-headline-sm text-headline-sm tracking-[3px] text-on-surface uppercase">FITBOARD</span>
        {user ? (
          <Link href="/fits" className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-colors">
            Enter →
          </Link>
        ) : (
          <Link href="/auth" className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-colors">
            Sign In
          </Link>
        )}
      </header>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
        <p className="font-label-caps text-label-caps uppercase tracking-[4px] text-secondary mb-6">
          Curated Style Intelligence
        </p>
        <h1 className="font-display text-display-mobile sm:text-display text-on-surface max-w-3xl leading-[1.05]">
          Wear the look.
          <br />
          Own every piece.
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mt-6">
          A shoppable lookbook of hand-curated outfits. Tap any look to reveal the exact
          pieces — and shop them in one click.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto">
          {user ? (
            <Link href="/fits"
              className="bg-secondary text-on-secondary font-label-caps text-label-caps uppercase tracking-widest px-xl py-md rounded-lg hover:bg-secondary-fixed transition-all hover:shadow-[0_0_24px_rgba(232,192,104,0.35)]">
              Enter FITBOARD →
            </Link>
          ) : (
            <>
              <Link href="/auth?next=/fits"
                className="bg-secondary text-on-secondary font-label-caps text-label-caps uppercase tracking-widest px-xl py-md rounded-lg hover:bg-secondary-fixed transition-all hover:shadow-[0_0_24px_rgba(232,192,104,0.35)]">
                Create Account
              </Link>
              <Link href="/auth?next=/fits"
                className="border border-outline-variant text-on-surface font-label-caps text-label-caps uppercase tracking-widest px-xl py-md rounded-lg hover:border-secondary hover:text-secondary transition-colors">
                Sign In
              </Link>
            </>
          )}
        </div>

        {!user && (
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-6">
            Sign in required to browse the feed.
          </p>
        )}
      </section>

      {/* Footer strip */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 px-6 sm:px-10 py-6 border-t border-outline-variant/50">
        <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 FITBOARD</p>
        <div className="flex gap-6">
          <Link href="/about" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">About</Link>
          <Link href="/terms" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">Terms</Link>
          <Link href="/privacy" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">Privacy</Link>
        </div>
      </footer>
    </main>
  )
}
