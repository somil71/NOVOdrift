import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'
import { createFitSchema } from '@/lib/validations/fit'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const vibe = searchParams.get('vibe')
  const search = searchParams.get('search')
  const limit = parseInt(searchParams.get('limit') ?? '12', 10)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  try {
    const supabase = await createSupabaseServerClient()
    let query = supabase
      .from('fits')
      .select('*', { count: 'exact' })
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (vibe && vibe !== 'All') {
      query = query.contains('vibe_tags', [vibe])
    }
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({ data, total: count ?? 0, limit, offset, error: null })
  } catch (err) {
    console.error('[GET /api/fits]', err)
    return NextResponse.json(
      { data: null, error: { message: 'Failed to fetch fits', code: 'SERVER_ERROR' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createFitSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten() } },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServiceClient()
    const { data, error } = await supabase
      .from('fits')
      .insert({ ...parsed.data, vibe_tags: parsed.data.vibe_tags ?? [], published: false })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/fits]', err)
    return NextResponse.json(
      { data: null, error: { message: 'Failed to create fit', code: 'SERVER_ERROR' } },
      { status: 500 }
    )
  }
}
