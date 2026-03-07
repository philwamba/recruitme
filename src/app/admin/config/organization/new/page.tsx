import { requireCurrentUser } from '@/lib/auth'
import { getOrganizationsForSelect, getAdminUsers } from '@/lib/admin/queries/organizations'
import { AdminPageHeader } from '@/components/admin'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants/routes'
import { OrganizationForm } from '../_components/organization-form'

export default async function NewOrganizationPage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_SYSTEM_SETTINGS',
    })

    const [organizations, adminUsers] = await Promise.all([
        getOrganizationsForSelect(),
        getAdminUsers(),
    ])

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="New Organization"
                description="Add a new organizational unit"
                backHref={ROUTES.ADMIN.CONFIG.ORGANIZATION}
                backLabel="Back to Organizations"
            />

            <Card>
                <CardContent className="pt-6">
                    <OrganizationForm
                        organizations={organizations}
                        adminUsers={adminUsers}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
