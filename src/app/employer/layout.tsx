import { requireCurrentUser } from '@/lib/auth'
import { EmployerShell } from '@/components/employer'
import { QueryProvider } from '@/components/providers/query-provider'

export default async function EmployerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    return (
        <QueryProvider>
            <EmployerShell user={user}>
                {children}
            </EmployerShell>
        </QueryProvider>
    )
}
