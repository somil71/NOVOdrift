import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
    return NextResponse.json({ data: { success: true }, error: null })
  } catch (err) {
    console.error('[POST /api/auth/logout]', err)
    return NextResponse.json(
      { data: null, error: { message: 'Logout failed', code: 'SERVER_ERROR' } },
      { status: 500 }
    )
  }
}
