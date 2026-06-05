import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'
import { createProductSchema } from '@/lib/validations/product'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') ?? 'newest'
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  try {
    const supabase = await createSupabaseServerClient()
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('published', true)
      .range(offset, offset + limit - 1)

    if (category) {
      query = query.eq('category', category)
    }
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (sort === 'price_asc') {
      query = query.order('price', { ascending: true, nullsFirst: false })
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false, nullsFirst: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({ data, total: count ?? 0, limit, offset, error: null })
  } catch (err) {
    console.error('[GET /api/products]', err)
    return NextResponse.json(
      { data: null, error: { message: 'Failed to fetch products', code: 'SERVER_ERROR' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ data: null, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = createProductSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten() } },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServiceClient()
    const { data, error } = await supabase
      .from('products')
      .insert({ ...parsed.data, tags: parsed.data.tags ?? [], published: false })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/products]', err)
    return NextResponse.json(
      { data: null, error: { message: 'Failed to create product', code: 'SERVER_ERROR' } },
      { status: 500 }
    )
  }
}
