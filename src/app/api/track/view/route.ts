import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

// Lightweight view counter. Content is auth-gated, so callers are signed-in users.
export async function POST(request: NextRequest) {
  try {
    const { type, id } = await request.json()
    if ((type !== 'fits' && type !== 'products') || typeof id !== 'string') {
      return NextResponse.json({ data: null, error: { message: 'Invalid params', code: 'BAD_REQUEST' } }, { status: 400 })
    }

    const supabase = await createSupabaseAdminClient()
    const { error } = await supabase.rpc('increment_view', { p_table: type, p_id: id })
    if (error) throw error

    return NextResponse.json({ data: { ok: true }, error: null })
  } catch (err) {
    console.error('[POST /api/track/view]', err)
    return NextResponse.json({ data: null, error: { message: 'Failed', code: 'SERVER_ERROR' } }, { status: 500 })
  }
}
