import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('pins')
      .select('*')
      .eq('fit_id', params.id)
      .order('created_at')

    if (error) throw error

    return NextResponse.json({ data: data ?? [], error: null })
  } catch (err) {
    console.error('[GET /api/fits/[id]/pins]', err)
    return NextResponse.json(
      { data: null, error: { message: 'Failed to fetch pins', code: 'SERVER_ERROR' } },
      { status: 500 }
    )
  }
}
