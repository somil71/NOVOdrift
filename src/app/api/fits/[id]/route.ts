import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'
import { updateFitSchema } from '@/lib/validations/fit'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: fit, error: fitError } = await supabase
      .from('fits')
      .select('*')
      .eq('id', params.id)
      .eq('published', true)
      .single()

    if (fitError || !fit) {
      return NextResponse.json({ data: null, error: { message: 'Fit not found', code: 'NOT_FOUND' } }, { status: 404 })
    }

    const { data: pins, error: pinsError } = await supabase
      .from('pins')
      .select('*')
      .eq('fit_id', params.id)
      .order('created_at')

    if (pinsError) throw pinsError
    return NextResponse.json({ data: { fit, pins: pins ?? [] }, error: null })
  } catch (err) {
    console.error('[GET /api/fits/[id]]', err)
    return NextResponse.json({ data: null, error: { message: 'Failed to fetch fit', code: 'SERVER_ERROR' } }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ data: null, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = updateFitSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten() } },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('fits')
      .update(parsed.data)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ data: null, error: { message: 'Fit not found', code: 'NOT_FOUND' } }, { status: 404 })
      throw error
    }
    return NextResponse.json({ data, error: null })
  } catch (err) {
    console.error('[PATCH /api/fits/[id]]', err)
    return NextResponse.json({ data: null, error: { message: 'Failed to update fit', code: 'SERVER_ERROR' } }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ data: null, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }, { status: 401 })
  }

  try {
    const supabase = await createSupabaseAdminClient()
    const { error } = await supabase.from('fits').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ data: { id: params.id }, error: null })
  } catch (err) {
    console.error('[DELETE /api/fits/[id]]', err)
    return NextResponse.json({ data: null, error: { message: 'Failed to delete fit', code: 'SERVER_ERROR' } }, { status: 500 })
  }
}
