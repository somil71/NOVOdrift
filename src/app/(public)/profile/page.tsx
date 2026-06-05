import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Fit } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

interface WishlistRow {
  id: string
  fit_id: string
  created_at: string
  fits: Fit | null
}

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?next=/profile')

  const { data: wishlistRows } = await supabase
    .from('wishlists')
    .select('id, fit_id, created_at, fits(id, title, image_url, vibe_tags, published)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const savedFits = (wishlistRows as WishlistRow[] ?? []).filter((w) => w.fits).map((w) => w.fits as Fit)

  const displayName = (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Fashion Curator'

  return (
    <>
      <main className="max-w-[800px] mx-auto px-lg pt-[120px] pb-huge">
        {/* Profile Header */}
        <section className="flex flex-col items-center text-center">
          <div className="w-[100px] h-[100px] rounded-full bg-surface-container-high border-2 border-outline-variant flex items-center justify-center mb-lg">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant">account_circle</span>
          </div>
          <h1 className="font-display text-display-mobile md:text-display text-on-surface tracking-tight">
            {displayName}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-base">{user.email}</p>
          <div className="flex gap-md mt-xl">
            <Link
              href="/admin/settings"
              className="bg-on-surface text-background font-label-caps text-label-caps px-lg py-xs rounded hover:bg-surface-tint transition-colors uppercase tracking-wider"
            >
              Settings
            </Link>
            <SignOutButton />
          </div>
        </section>

        {/* Saved Fits */}
        <nav className="flex justify-center gap-xl border-b border-outline-variant mt-xxl mb-xl sticky top-[64px] bg-background/95 backdrop-blur-sm z-40 pt-md">
          <button className="pb-sm font-label-caps text-label-caps text-secondary border-b-2 border-secondary uppercase tracking-widest">
            Saved Fits
            <span className="text-on-surface-variant ml-xs">{savedFits.length}</span>
          </button>
        </nav>

        {savedFits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xxl text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-md opacity-40">bookmark</span>
            <p className="font-headline-sm text-headline-sm">No saved fits yet</p>
            <p className="font-body-md text-body-md mt-xs mb-xl">Browse the feed and save looks you love</p>
            <Link
              href="/fits"
              className="bg-secondary text-on-secondary font-label-caps text-label-caps uppercase px-lg py-sm rounded hover:bg-secondary-fixed transition-colors tracking-wider"
            >
              Browse Feed
            </Link>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 gap-md space-y-md">
            {savedFits.map((fit) => (
              <Link key={fit.id} href={`/fits/${fit.id}`} className="block relative group break-inside-avoid rounded overflow-hidden border border-surface-container-highest">
                <Image
                  src={fit.image_url}
                  alt={fit.title}
                  width={400}
                  height={500}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-md">
                  <p className="font-label-caps text-label-caps text-on-surface">{fit.title}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

function SignOutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className="border border-outline-variant text-on-surface font-label-caps text-label-caps px-lg py-xs rounded hover:bg-surface-container-low hover:border-secondary transition-colors uppercase tracking-wider"
      >
        Sign Out
      </button>
    </form>
  )
}
