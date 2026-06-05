import Link from 'next/link'
import { Search } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-bg-primary/90 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/fits"
          className="text-xl font-bold tracking-tight text-text-primary hover:text-accent-gold transition-colors"
        >
          FitBoard
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/search/fits"
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <Search size={15} />
            Search Fits
          </Link>
          <Link
            href="/search/products"
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <Search size={15} />
            Search Products
          </Link>
        </div>
      </nav>
    </header>
  )
}
