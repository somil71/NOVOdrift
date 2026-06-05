import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }, { status: 401 })

    const { data, error } = await supabase
      .from('wishlists')
      .select('id, fit_id, created_at, fits(id, title, image_url, vibe_tags)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data: data ?? [], error: null })
  } catch (err) {
    console.error('[GET /api/user/wishlist]', err)
    return NextResponse.json({ data: null, error: { message: 'Failed to fetch wishlist', code: 'SERVER_ERROR' } }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }, { status: 401 })

    const { fit_id } = await request.json()
    if (!fit_id) return NextResponse.json({ data: null, error: { message: 'fit_id required', code: 'VALIDATION_ERROR' } }, { status: 400 })

    const { data, error } = await supabase
      .from('wishlists')
      .upsert({ user_id: user.id, fit_id }, { onConflict: 'user_id,fit_id' })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/user/wishlist]', err)
    return NextResponse.json({ data: null, error: { message: 'Failed to save', code: 'SERVER_ERROR' } }, { status: 500 })
  }
}
