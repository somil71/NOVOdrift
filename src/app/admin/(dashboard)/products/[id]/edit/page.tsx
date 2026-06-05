import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'

interface PageProps {
  params: { id: string }
}

export default async function EditProductPage({ params }: PageProps) {
  const supabase = await createSupabaseAdminClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!product) notFound()

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-on-surface mb-6">Edit Product</h1>
      <ProductForm mode="edit" initialData={product} />
    </div>
  )
}
