import Link from 'next/link'
import NewsletterForm from './NewsletterForm'

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant mt-xxl">
      <div className="max-w-7xl mx-auto px-lg py-xxl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-xl mb-xxl">
          {/* Col 1 — Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="font-headline-sm text-headline-sm tracking-[3px] text-on-surface uppercase mb-sm">
              FITBOARD
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg leading-relaxed">
              Wear the look. Own every piece.
            </p>
            <div className="flex gap-md">
              {/* Replace # with real social links when available */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-on-surface-variant hover:text-secondary transition-colors">
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              </a>
            </div>
          </div>

          {/* Col 2 — Explore */}
          <div>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-md">
              Explore
            </p>
            <ul className="flex flex-col gap-sm">
              {[
                { href: '/fits', label: 'Fits' },
                { href: '/search/products', label: 'Shop Products' },
                { href: '/about', label: 'About' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Legal */}
          <div>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-md">
              Legal
            </p>
            <ul className="flex flex-col gap-sm">
              {[
                { href: '/terms', label: 'Terms & Conditions' },
                { href: '/privacy', label: 'Privacy Policy' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-lg leading-relaxed opacity-60">
              Affiliate Disclosure: We earn commissions on purchases made through links on this site.
            </p>
          </div>

          {/* Col 4 — Connect */}
          <div>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-md">
              Connect
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
              Curated fits, dropped weekly.
            </p>
            <NewsletterForm />
            <p className="font-body-sm text-body-sm text-on-surface-variant opacity-50 mt-xs">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-outline-variant pt-lg flex flex-col md:flex-row justify-between items-center gap-sm">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © 2026 FITBOARD. All rights reserved.
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant opacity-50">
            Built with Next.js + Supabase
          </p>
        </div>
      </div>
    </footer>
  )
}
