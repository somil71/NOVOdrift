import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'
import { updateProductSchema } from '@/lib/validations/product'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ data: null, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = updateProductSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten() } },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServiceClient()
    const { data, error } = await supabase.from('products').update(parsed.data).eq('id', params.id).select().single()
    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ data: null, error: { message: 'Product not found', code: 'NOT_FOUND' } }, { status: 404 })
      throw error
    }
    return NextResponse.json({ data, error: null })
  } catch (err) {
    console.error('[PATCH /api/products/[id]]', err)
    return NextResponse.json({ data: null, error: { message: 'Failed to update product', code: 'SERVER_ERROR' } }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ data: null, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }, { status: 401 })
  }

  try {
    const supabase = await createSupabaseServiceClient()
    const { error } = await supabase.from('products').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ data: { id: params.id }, error: null })
  } catch (err) {
    console.error('[DELETE /api/products/[id]]', err)
    return NextResponse.json({ data: null, error: { message: 'Failed to delete product', code: 'SERVER_ERROR' } }, { status: 500 })
  }
}
