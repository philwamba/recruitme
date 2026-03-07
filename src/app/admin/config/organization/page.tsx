import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getOrganizations } from '@/lib/admin/queries/organizations'
import { AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { OrganizationsTable } from './_components/organizations-table'

export const dynamic = 'force-dynamic'

export default async function OrganizationPage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_SYSTEM_SETTINGS',
    })

    const { organizations } = await getOrganizations()

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Organization Structure"
                description="Manage company, divisions, departments, and teams"
                actions={
                    <Button asChild>
                        <Link href={`${ROUTES.ADMIN.CONFIG.ORGANIZATION}/new`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Organization
                        </Link>
                    </Button>
                }
            />

            <OrganizationsTable organizations={organizations} />
        </div>
    )
}
