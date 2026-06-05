import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server'

// Simple in-memory rate limiter — 60 requests per IP per minute
// Note: resets on cold start (serverless). Acceptable for click fraud protection.
const rateMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 60) return false
  entry.count++
  return true
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { searchParams } = request.nextUrl
  const pinId = searchParams.get('pin')
  const productId = searchParams.get('product')
  const referrer = request.headers.get('referer') ?? null

  if (!pinId && !productId) {
    return NextResponse.json({ error: 'Missing pin or product param' }, { status: 400 })
  }

  try {
    const supabase = await createSupabaseAdminClient()
    const userClient = await createSupabaseServerClient()
    const { data: { user } } = await userClient.auth.getUser()

    let destinationUrl: string | null = null
    let fitId: string | null = null

    if (pinId) {
      const { data: pin } = await supabase
        .from('pins')
        .select('affiliate_url, fit_id')
        .eq('id', pinId)
        .single()

      if (!pin) return NextResponse.redirect(new URL('/fits', request.url))
      destinationUrl = pin.affiliate_url
      fitId = pin.fit_id

      await supabase.from('click_events').insert({
        type: 'pin',
        pin_id: pinId,
        fit_id: fitId,
        destination_url: destinationUrl,
        referrer,
        user_id: user?.id ?? null,
      })
    } else if (productId) {
      const { data: product } = await supabase
        .from('products')
        .select('affiliate_url')
        .eq('id', productId)
        .single()

      if (!product) return NextResponse.redirect(new URL('/search/products', request.url))
      destinationUrl = product.affiliate_url

      await supabase.from('click_events').insert({
        type: 'product',
        product_id: productId,
        destination_url: destinationUrl,
        referrer,
        user_id: user?.id ?? null,
      })
    }

    return NextResponse.redirect(destinationUrl!, { status: 307 })
  } catch {
    return NextResponse.redirect(new URL('/fits', request.url))
  }
}
