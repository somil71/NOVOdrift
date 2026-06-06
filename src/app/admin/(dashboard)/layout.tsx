import AdminSidebar from '@/components/ui/AdminSidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      <AdminSidebar />
      {/* mobile: full width with top-bar offset; desktop: offset by the fixed sidebar */}
      <main className="md:ml-[240px] min-h-screen bg-background pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}
