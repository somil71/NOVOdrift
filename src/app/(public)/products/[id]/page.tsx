import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Product, Fit } from '@/lib/supabase/types'

export const revalidate = 60

interface PageProps { params: { id: string } }

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('products').select('*').eq('id', id).eq('published', true).single()
  return data
}

async function getFitsWithProduct(affiliateUrl: string): Promise<Fit[]> {
  const supabase = await createSupabaseServerClient()
  const { data: pins } = await supabase
    .from('pins')
    .select('fit_id')
    .eq('affiliate_url', affiliateUrl)
    .limit(6)

  if (!pins || pins.length === 0) return []
  const fitIds = Array.from(new Set(pins.map((p) => p.fit_id)))
  const { data: fits } = await supabase
    .from('fits')
    .select('*')
    .in('id', fitIds)
    .eq('published', true)
  return fits ?? []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProduct(params.id)
  if (!product) return { title: 'Product Not Found — FITBOARD' }
  return {
    title: `${product.name}${product.brand ? ` by ${product.brand}` : ''} — FITBOARD`,
    description: `Shop ${product.name} on FITBOARD.`,
    openGraph: { images: product.image_url ? [product.image_url] : [] },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  const relatedFits = await getFitsWithProduct(product.affiliate_url)

  return (
    <main className="max-w-7xl mx-auto px-lg py-xxl pt-[120px]">
      <Link href="/search/products" className="inline-flex items-center gap-xs font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors mb-xl uppercase tracking-widest">
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Products
      </Link>

      <div className="flex flex-col lg:flex-row gap-xxl">
        {/* Product Image */}
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant">
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="400px" priority />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[64px] text-on-surface-variant opacity-30">shopping_bag</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col gap-lg">
          <div>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-xs">
              {product.brand ?? product.category}
            </p>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">{product.name}</h1>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mt-xs">
              {product.category}
            </p>
          </div>

          {product.price != null && (
            <p className="font-display-mobile text-display-mobile text-secondary">
              ₹{product.price.toLocaleString('en-IN')}
            </p>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-xs">
              {product.tags.map((tag) => (
                <span key={tag} className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container rounded-full px-md py-xs border border-outline-variant uppercase">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <a
            href={`/api/track/r?product=${product.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-sm bg-secondary text-on-secondary font-label-caps text-label-caps uppercase px-xl py-md rounded hover:bg-secondary-fixed hover:shadow-[0_0_15px_rgba(233,193,105,0.3)] transition-all duration-300 tracking-widest w-fit"
          >
            Buy Now
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>open_in_new</span>
          </a>
        </div>
      </div>

      {/* Seen in fits */}
      {relatedFits.length > 0 && (
        <section className="mt-xxl">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-lg">Seen in these fits</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md">
            {relatedFits.map((fit) => (
              <Link key={fit.id} href={`/fits/${fit.id}`} className="group relative aspect-[3/4] rounded overflow-hidden border border-outline-variant hover:border-secondary transition-colors">
                <Image src={fit.image_url} alt={fit.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="200px" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/80 to-transparent p-xs">
                  <p className="font-body-sm text-body-sm text-on-surface line-clamp-1">{fit.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
