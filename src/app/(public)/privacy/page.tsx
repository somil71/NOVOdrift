import Navbar from '@/components/ui/Navbar'

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-text-primary mb-2">Privacy Policy</h1>
        <p className="text-text-muted text-sm mb-8">Last updated: June 2026</p>
        <div className="space-y-6 text-text-muted leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">Data We Collect</h2>
            <p>
              FitBoard does not require you to create an account. We do not collect personal
              information from visitors. Third-party services (Vercel Analytics) may collect
              aggregate, anonymized page view data.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">Cookies</h2>
            <p>
              No tracking cookies are set for visitors. If you access the admin panel,
              a secure, HttpOnly session cookie is used for authentication only.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">Third-Party Links</h2>
            <p>
              FitBoard links to third-party retailers via affiliate links. Once you leave our
              site, their privacy policies apply. We are not responsible for external sites.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">Contact</h2>
            <p>For privacy questions, contact us via our Instagram account.</p>
          </section>
        </div>
      </main>
    </>
  )
}
