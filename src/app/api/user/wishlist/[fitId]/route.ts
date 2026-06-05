import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest, { params }: { params: { fitId: string } }) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }, { status: 401 })

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('fit_id', params.fitId)

    if (error) throw error
    return NextResponse.json({ data: { fit_id: params.fitId }, error: null })
  } catch (err) {
    console.error('[DELETE /api/user/wishlist/[fitId]]', err)
    return NextResponse.json({ data: null, error: { message: 'Failed to remove', code: 'SERVER_ERROR' } }, { status: 500 })
  }
}
