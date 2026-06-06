import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Product, Fit } from '@/lib/supabase/types'

export const revalidate = 60

interface PageProps { params: { id: string } }

const VIBE_FALLBACK = '#E8C068'

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
const rgba = (hex: string, a: number) => {
  try { const [r, g, b] = hexToRgb(hex); return `rgba(${r}, ${g}, ${b}, ${a})` }
  catch { return `rgba(232,192,104,${a})` }
}

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('products').select('*').eq('id', id).eq('published', true).single()
  return data
}

async function getRelated(product: Product): Promise<{ fits: Fit[]; products: Product[] }> {
  const supabase = await createSupabaseServerClient()

  // Fits that feature this product (matched by affiliate URL on a pin)
  const { data: pins } = await supabase.from('pins').select('fit_id').eq('affiliate_url', product.affiliate_url).limit(6)
  let fits: Fit[] = []
  if (pins && pins.length) {
    const fitIds = Array.from(new Set(pins.map((p) => p.fit_id)))
    const { data } = await supabase.from('fits').select('*').in('id', fitIds).eq('published', true)
    fits = data ?? []
  }

  // Similar products — same category, exclude self
  const { data: products } = await supabase
    .from('products').select('*').eq('published', true).eq('category', product.category)
    .neq('id', product.id).order('created_at', { ascending: false }).limit(6)

  return { fits, products: products ?? [] }
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

  const { fits, products } = await getRelated(product)
  const accent = product.accent_color ?? VIBE_FALLBACK

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient accent auras (admin-set theme) */}
      <div className="pointer-events-none fixed top-[-120px] right-0 w-[500px] h-[500px] rounded-full" style={{ background: accent, filter: 'blur(120px)', opacity: 0.1 }} />
      <div className="pointer-events-none fixed bottom-[-80px] left-[-60px] w-[320px] h-[320px] rounded-full" style={{ background: accent, filter: 'blur(90px)', opacity: 0.07 }} />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-lg pt-[100px] pb-xxl">
        <Link href="/search/products" className="inline-flex items-center gap-xs font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors mb-lg uppercase tracking-widest">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Products
        </Link>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Central figure — image with accent halo */}
          <div className="w-full sm:w-[360px] flex-shrink-0 flex justify-center">
            <div className="relative w-full max-w-[360px]" style={{ aspectRatio: '1 / 1' }}>
              <div className="absolute -inset-6 rounded-3xl" style={{ background: accent, filter: 'blur(45px)', opacity: 0.3 }} />
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-surface-container-low"
                style={{ border: `1px solid ${rgba(accent, 0.3)}`, boxShadow: `0 0 50px ${rgba(accent, 0.35)}` }}>
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-contain p-3" sizes="360px" priority />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[64px] text-on-surface-variant opacity-30">shopping_bag</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 w-full">
            <p className="font-label-caps text-label-caps uppercase tracking-widest mb-2" style={{ color: accent }}>
              {product.brand ?? product.category}
            </p>
            <h1 className="font-display-mobile text-display-mobile text-on-surface leading-tight">{product.name}</h1>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mt-2">{product.category}</p>

            {product.price != null && (
              <p className="font-headline-lg text-headline-lg mt-4" style={{ color: accent }}>
                ₹{product.price.toLocaleString('en-IN')}
              </p>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-xs mt-4">
                {product.tags.map((tag) => (
                  <span key={tag} className="font-label-caps text-label-caps rounded-full px-md py-xs border uppercase"
                    style={{ borderColor: rgba(accent, 0.4), color: accent }}>{tag}</span>
                ))}
              </div>
            )}

            <a href={`/api/track/r?product=${product.id}`} target="_blank" rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-sm font-label-caps text-label-caps uppercase px-xl py-md rounded-lg transition-all duration-300 tracking-widest w-full sm:w-fit"
              style={{ background: accent, color: '#1A1A1A', boxShadow: `0 0 20px ${rgba(accent, 0.4)}` }}>
              Buy Now
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>open_in_new</span>
            </a>

            {/* Seen in fits */}
            {fits.length > 0 && (
              <div className="mt-10">
                <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-3">Seen in these fits</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {fits.slice(0, 4).map((fit) => (
                    <Link key={fit.id} href={`/fits/${fit.id}`} className="group relative aspect-[3/4] rounded-lg overflow-hidden border transition-all"
                      style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <Image src={fit.image_url} alt={fit.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="120px" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                        <p className="text-[11px] text-white line-clamp-1">{fit.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar products */}
        {products.length > 0 && (
          <section className="mt-16">
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-5">More in {product.category}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {products.map((p) => (
                <Link key={p.id} href={`/products/${p.id}`}
                  className="group flex flex-col bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden hover:border-secondary transition-colors">
                  <div className="relative aspect-square bg-surface-container">
                    {p.image_url
                      ? <Image src={p.image_url} alt={p.name} fill className="object-contain p-2" sizes="200px" />
                      : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-on-surface-variant opacity-30">shopping_bag</span></div>}
                  </div>
                  <div className="p-2">
                    <p className="font-body-sm text-body-sm text-on-surface line-clamp-1">{p.name}</p>
                    {p.price != null && <p className="text-xs mt-0.5" style={{ color: p.accent_color ?? VIBE_FALLBACK }}>₹{p.price.toLocaleString('en-IN')}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
