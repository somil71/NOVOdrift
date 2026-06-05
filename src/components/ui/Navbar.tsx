import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
      <nav className="flex justify-between items-center h-16 px-lg max-w-7xl mx-auto">
        <Link
          href="/fits"
          className="font-headline-sm text-headline-sm tracking-[3px] text-on-surface hover:text-secondary transition-colors duration-200 uppercase"
        >
          FITBOARD
        </Link>
        <div className="hidden md:flex items-center gap-lg">
          <Link
            href="/search/fits"
            className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors duration-200"
          >
            Search Fits
          </Link>
          <Link
            href="/search/products"
            className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors duration-200"
          >
            Shop Products
          </Link>
        </div>
        <div className="flex items-center gap-md">
          <Link
            href="/search/fits"
            className="text-on-surface hover:text-secondary transition-colors duration-200"
            aria-label="Search"
          >
            <span className="material-symbols-outlined text-[22px]">search</span>
          </Link>
        </div>
      </nav>
    </header>
  )
}
