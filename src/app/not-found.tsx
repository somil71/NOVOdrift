import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="text-8xl font-bold text-secondary mb-4">404</p>
        <h1 className="text-2xl font-bold text-on-surface mb-2">Page Not Found</h1>
        <p className="text-on-surface-variant mb-8">This fit doesn&apos;t exist or has been unpublished.</p>
        <Link
          href="/fits"
          className="bg-secondary text-on-secondary font-semibold px-6 py-3 rounded-lg hover:bg-secondary-fixed transition-colors"
        >
          Back to Feed
        </Link>
      </main>
    </>
  )
}
