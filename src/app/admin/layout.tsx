import { requireCurrentUser } from '@/lib/auth'
import { AdminShell } from '@/components/admin'
import { QueryProvider } from '@/components/providers/query-provider'
import { getSidebarCounts } from '@/lib/admin/queries/sidebar-counts'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
    })
    const counts = await getSidebarCounts()

    return (
        <QueryProvider>
            <AdminShell user={user} counts={counts}>
                {children}
            </AdminShell>
        </QueryProvider>
    )
}
