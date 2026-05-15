import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const metadata = {
  title: { default: 'Admin', template: '%s — TNE Admin' },
}

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // Temporary diagnostic log — remove after debugging
  console.log('[admin-layout] session:', JSON.stringify({
    hasSession: !!session,
    userId: session?.user?.id,
    email: session?.user?.email,
    role: (session?.user as { role?: string } | undefined)?.role,
  }))

  if (!session?.user) {
    redirect('/admin/login')
  }

  // Only EDITOR and ADMIN roles can access the admin
  const role = (session.user as { role?: string }).role
  if (role !== 'EDITOR' && role !== 'ADMIN') {
    redirect('/admin/login')
  }

  return (
    <div className="admin-shell">
      <AdminSidebar role={role} />
      <div className="admin-main">{children}</div>
    </div>
  )
}
