import { requireCurrentUser } from '@/lib/auth'
import { AdminShell } from '@/components/admin'
import { QueryProvider } from '@/components/providers/query-provider'
import { getSidebarCounts } from '@/lib/admin/queries/sidebar-counts'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [user, counts] = await Promise.all([
        requireCurrentUser({
            roles: ['ADMIN'],
        }),
        getSidebarCounts(),
    ])

    return (
        <QueryProvider>
            <AdminShell user={user} counts={counts}>
                {children}
            </AdminShell>
        </QueryProvider>
    )
}
