import { Suspense } from 'react'
import Navbar from '@/components/ui/Navbar'
import ProductGrid from '@/components/search/ProductGrid'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'

export default function SearchProductsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-on-surface mb-6">Search Products</h1>
        <Suspense
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <ProductGrid />
        </Suspense>
      </main>
    </>
  )
}
