'use client'

import { useRouter } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'

export default function NewProductPage() {
  const router = useRouter()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">New Product</h1>
      <ProductForm mode="create" onSuccess={() => router.push('/admin/products')} />
    </div>
  )
}
