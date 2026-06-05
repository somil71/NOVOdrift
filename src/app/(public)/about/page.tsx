
export default function AboutPage() {
  return (
    <>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-on-surface mb-6">About FitBoard</h1>
        <div className="prose prose-invert max-w-none space-y-4 text-on-surface-variant leading-relaxed">
          <p>
            FitBoard is an editorial fashion discovery platform where outfits are the hero.
            Every look on FitBoard is a hand-curated ensemble — styled, sourced, and linked
            so you can shop the exact pieces worn.
          </p>
          <p>
            We believe the outfit tells a story. The jacket, the shoes, the watch — each piece
            plays a role. FitBoard lets you explore that story visually and buy any part of it
            in one click.
          </p>
          <p>
            Think of us as a shoppable lookbook. Not a store. Not a list. The outfit is always
            the hero, and commerce is embedded invisibly inside it — until you want it.
          </p>
          <h2 className="text-xl font-bold text-on-surface mt-8">How it works</h2>
          <p>
            Browse outfits on the feed. Filter by your aesthetic. Open any fit to see
            interactive pins placed on each product in the image. Hover to see details.
            Click to buy — directly from the retailer.
          </p>
        </div>
      </main>
    </>
  )
}
