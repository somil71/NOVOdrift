import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createSupabaseServerClient()

    // Verify fit is published before returning its pins to anonymous callers.
    // Admin (authenticated) can see pins for drafts.
    const { data: { user } } = await supabase.auth.getUser()

    const fitQuery = supabase.from('fits').select('id, published').eq('id', params.id).single()
    const { data: fit } = await fitQuery

    if (!fit) {
      return NextResponse.json({ data: null, error: { message: 'Fit not found', code: 'NOT_FOUND' } }, { status: 404 })
    }

    // Non-authenticated users cannot see pins for unpublished fits
    if (!fit.published && !user) {
      return NextResponse.json({ data: null, error: { message: 'Fit not found', code: 'NOT_FOUND' } }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('pins')
      .select('*')
      .eq('fit_id', params.id)
      .order('created_at')

    if (error) throw error
    return NextResponse.json({ data: data ?? [], error: null })
  } catch (err) {
    console.error('[GET /api/fits/[id]/pins]', err)
    return NextResponse.json({ data: null, error: { message: 'Failed to fetch pins', code: 'SERVER_ERROR' } }, { status: 500 })
  }
}
