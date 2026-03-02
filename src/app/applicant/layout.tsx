import { requireCurrentUser } from '@/lib/auth'
import { ApplicantShell } from '@/components/layout/applicant-shell'

export const dynamic = 'force-dynamic'

export default async function ApplicantLayout({
    children,
}: {
  children: React.ReactNode
}) {
    const user = await requireCurrentUser({
        roles: ['APPLICANT'],
        permission: 'VIEW_APPLICANT_DASHBOARD',
    })

    return <ApplicantShell user={user}>{children}</ApplicantShell>
}
