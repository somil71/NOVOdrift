import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-lg py-xxl pt-[120px]">
      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-lg">About FITBOARD</h1>

      <div className="space-y-lg text-on-surface-variant font-body-md text-body-md leading-relaxed">
        <p>
          FITBOARD is an editorial fashion discovery platform where outfits are the hero.
          Every look is a hand-curated ensemble — styled, sourced, and linked so you can
          shop the exact pieces worn.
        </p>
        <p>
          We believe the outfit tells a story. The jacket, the shoes, the watch — each piece
          plays a role. FITBOARD lets you explore that story visually and buy any part of it
          in one click.
        </p>
        <p>
          Think of it as a shoppable lookbook. Not a store. Not a list. The outfit is always
          the hero, and commerce is embedded invisibly inside it — until you want it.
        </p>

        <div className="border-t border-outline-variant pt-lg mt-xl">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md">How it works</h2>
          <ol className="space-y-sm list-none">
            {[
              'Browse outfits on the feed — filter by your aesthetic (Street, Minimal, Ethnic, etc.)',
              'Open any fit to see interactive pins placed on each product in the image',
              'Hover a pin to see product name, brand, and price',
              'Click to buy — you go directly to the retailer',
            ].map((step, i) => (
              <li key={i} className="flex gap-md">
                <span className="text-secondary font-headline-sm text-headline-sm flex-shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="border-t border-outline-variant pt-lg mt-xl">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md">Affiliate Disclosure</h2>
          <p>
            FITBOARD earns a commission on purchases made through links on this site.
            This comes at no extra cost to you. We only link products we&apos;d genuinely wear.
          </p>
        </div>
      </div>

      <div className="flex gap-md mt-xxl">
        <Link
          href="/fits"
          className="bg-secondary text-on-secondary font-label-caps text-label-caps uppercase px-lg py-sm rounded hover:bg-secondary-fixed transition-colors tracking-widest"
        >
          Browse Feed
        </Link>
        <Link
          href="/search/products"
          className="border border-outline-variant text-on-surface font-label-caps text-label-caps uppercase px-lg py-sm rounded hover:border-secondary hover:text-secondary transition-colors tracking-widest"
        >
          Shop Products
        </Link>
      </div>
    </main>
  )
}
