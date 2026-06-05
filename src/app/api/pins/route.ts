import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { createPinSchema } from '@/lib/validations/pin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createPinSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten() } },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServiceClient()

    // Verify the fit exists
    const { data: fit } = await supabase
      .from('fits')
      .select('id')
      .eq('id', parsed.data.fit_id)
      .single()

    if (!fit) {
      return NextResponse.json(
        { data: null, error: { message: 'Fit not found', code: 'NOT_FOUND' } },
        { status: 404 }
      )
    }

    const { data, error } = await supabase.from('pins').insert(parsed.data).select().single()

    if (error) throw error

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/pins]', err)
    return NextResponse.json(
      { data: null, error: { message: 'Failed to create pin', code: 'SERVER_ERROR' } },
      { status: 500 }
    )
  }
}
