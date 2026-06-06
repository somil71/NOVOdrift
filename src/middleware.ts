import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminEmail } from '@/lib/admin'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '*'

function withCors(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', SITE_URL)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { method } = request

  // Handle OPTIONS preflight
  if (method === 'OPTIONS') {
    return withCors(new NextResponse(null, { status: 204 }))
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Always use getUser() — validates session against Supabase server
  const { data: { user } } = await supabase.auth.getUser()

  const admin = isAdminEmail(user?.email)

  // Protect admin frontend pages — must be logged in AND on the admin allowlist
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!user) {
      return withCors(NextResponse.redirect(new URL('/admin/login', request.url)))
    }
    if (!admin) {
      // Logged in but not an admin → bounce to the public feed
      return withCors(NextResponse.redirect(new URL('/fits', request.url)))
    }
  }

  // Protect content-write API routes — admin only
  const isApiMutation = (
    pathname.startsWith('/api/fits') ||
    pathname.startsWith('/api/pins') ||
    pathname.startsWith('/api/products') ||
    pathname.startsWith('/api/upload')
  ) && ['POST', 'PATCH', 'DELETE', 'PUT'].includes(request.method)

  if (isApiMutation && (!user || !admin)) {
    return withCors(
      NextResponse.json(
        { data: null, error: { message: user ? 'Forbidden' : 'Unauthorized', code: user ? 'FORBIDDEN' : 'UNAUTHORIZED' } },
        { status: user ? 403 : 401 }
      )
    )
  }

  // Compulsory auth for all content pages — landing (/) and /auth stay public.
  // Unauthenticated visitors are sent to /auth and returned after login.
  const isGatedContent = (
    pathname === '/fits' ||
    pathname.startsWith('/fits/') ||
    pathname.startsWith('/search') ||
    pathname.startsWith('/products/') ||
    pathname === '/profile' ||
    pathname === '/account'
  )

  if (isGatedContent && !user) {
    const next = encodeURIComponent(pathname + (request.nextUrl.search || ''))
    return withCors(NextResponse.redirect(new URL(`/auth?next=${next}`, request.url)))
  }

  return withCors(supabaseResponse)
}

export const config = {
  matcher: [
    // Catch /admin exactly AND /admin/* except /admin/login
    '/admin',
    '/admin/((?!login).*)',
    // Gated content (compulsory login)
    '/fits',
    '/fits/:path*',
    '/search/:path*',
    '/products/:path*',
    '/profile',
    '/account',
    // API guards
    '/api/fits/:path*',
    '/api/pins/:path*',
    '/api/products/:path*',
    '/api/upload',
  ],
}
