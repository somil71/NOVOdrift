import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import ProductsTable from '@/components/admin/ProductsTable'

export const dynamic = 'force-dynamic'

async function getAllProducts() {
  const supabase = await createSupabaseAdminClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function AdminProductsPage() {
  const products = await getAllProducts()

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Products</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">{products.length} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-secondary text-on-secondary font-semibold
            px-4 py-2 rounded-lg hover:bg-secondary-fixed transition-colors text-sm"
        >
          <Plus size={16} />
          New Product
        </Link>
      </div>
      <ProductsTable products={products} />
    </div>
  )
}
