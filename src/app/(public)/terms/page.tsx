
export default function TermsPage() {
  return (
    <>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-on-surface mb-2">Terms of Service</h1>
        <p className="text-on-surface-variant text-sm mb-8">Last updated: June 2026</p>
        <div className="space-y-6 text-on-surface-variant leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-2">1. Use of Service</h2>
            <p>
              FitBoard provides outfit discovery and affiliate links to third-party retailers.
              By using this service you agree to these terms. We reserve the right to modify
              or discontinue the service at any time.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-2">2. Affiliate Disclosure</h2>
            <p>
              FitBoard participates in affiliate programs. When you click a product link and
              make a purchase, we may earn a commission at no additional cost to you.
              All prices displayed are approximate and may differ on the retailer&apos;s site.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-2">3. Intellectual Property</h2>
            <p>
              All outfit images, editorial content, and design elements are the property of
              FitBoard or their respective owners. Do not reproduce without permission.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-2">4. Limitation of Liability</h2>
            <p>
              FitBoard is not responsible for third-party transactions, product quality, or
              delivery. All purchases are made directly with the retailer.
            </p>
          </section>
        </div>
      </main>
    </>
  )
}
