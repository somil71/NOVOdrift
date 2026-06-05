import AdminSidebar from '@/components/ui/AdminSidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen flex overflow-hidden">
      <AdminSidebar />
      <main className="ml-[240px] flex-1 h-screen overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  )
}
