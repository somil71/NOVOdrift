import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  // Protect admin frontend pages
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !user) {
    return withCors(NextResponse.redirect(new URL('/admin/login', request.url)))
  }

  // Protect mutation API routes — belt-and-suspenders on top of per-route checks
  const isApiMutation = (
    pathname.startsWith('/api/fits') ||
    pathname.startsWith('/api/pins') ||
    pathname.startsWith('/api/products') ||
    pathname.startsWith('/api/upload')
  ) && ['POST', 'PATCH', 'DELETE', 'PUT'].includes(request.method)

  if (isApiMutation && !user) {
    return withCors(
      NextResponse.json(
        { data: null, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      )
    )
  }

  // Protect user-only pages
  if ((pathname === '/profile' || pathname === '/account') && !user) {
    return withCors(NextResponse.redirect(new URL(`/auth?next=${pathname}`, request.url)))
  }

  return withCors(supabaseResponse)
}

export const config = {
  matcher: [
    // Catch /admin exactly AND /admin/* except /admin/login
    '/admin',
    '/admin/((?!login).*)',
    '/profile',
    '/account',
    '/api/fits/:path*',
    '/api/pins/:path*',
    '/api/products/:path*',
    '/api/upload',
  ],
}
