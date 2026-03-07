import { notFound } from 'next/navigation'
import { requireCurrentUser } from '@/lib/auth'
import { getOrganizationById, getOrganizationsForSelect, getAdminUsers } from '@/lib/admin/queries/organizations'
import { AdminPageHeader } from '@/components/admin'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants/routes'
import { OrganizationForm } from '../../_components/organization-form'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditOrganizationPage({ params }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_SYSTEM_SETTINGS',
    })

    const { id } = await params
    const [organization, organizations, adminUsers] = await Promise.all([
        getOrganizationById(id),
        getOrganizationsForSelect(),
        getAdminUsers(),
    ])

    if (!organization) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Edit Organization"
                description={`Update ${organization.name}`}
                backHref={ROUTES.ADMIN.CONFIG.ORGANIZATION}
                backLabel="Back to Organizations"
            />

            <Card>
                <CardContent className="pt-6">
                    <OrganizationForm
                        organization={organization}
                        organizations={organizations}
                        adminUsers={adminUsers}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
