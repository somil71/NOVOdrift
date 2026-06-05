import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

const ALLOWED_BUCKETS = ['fit-images', 'product-images'] as const
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 10 * 1024 * 1024
const MIME_TO_EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

export async function POST(request: NextRequest) {
  // Must be authenticated to upload — prevents storage DoS from anonymous users
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ data: null, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucket = formData.get('bucket') as string | null

    if (!file) {
      return NextResponse.json({ data: null, error: { message: 'No file provided', code: 'NO_FILE' } }, { status: 400 })
    }
    if (!bucket || !ALLOWED_BUCKETS.includes(bucket as (typeof ALLOWED_BUCKETS)[number])) {
      return NextResponse.json({ data: null, error: { message: 'Invalid bucket', code: 'INVALID_BUCKET' } }, { status: 400 })
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ data: null, error: { message: 'File must be JPEG, PNG, or WebP', code: 'INVALID_TYPE' } }, { status: 400 })
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ data: null, error: { message: 'File must be 10 MB or smaller', code: 'FILE_TOO_LARGE' } }, { status: 400 })
    }

    const ext = MIME_TO_EXT[file.type]
    const filename = `${randomUUID()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const supabase = await createSupabaseServiceClient()
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, { contentType: file.type, upsert: false })

    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filename)
    return NextResponse.json({ data: { url: publicUrlData.publicUrl }, error: null }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/upload]', err)
    return NextResponse.json({ data: null, error: { message: 'Upload failed', code: 'SERVER_ERROR' } }, { status: 500 })
  }
}
