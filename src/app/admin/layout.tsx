import { requireCurrentUser } from '@/lib/auth'
import { AdminShell } from '@/components/admin'
import { QueryProvider } from '@/components/providers/query-provider'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
    })

    return (
        <QueryProvider>
            <AdminShell user={user}>
                {children}
            </AdminShell>
        </QueryProvider>
    )
}
