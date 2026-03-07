import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getActiveJobs } from '@/lib/admin/queries/candidate-imports'
import { AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { ImportWizard } from './_components/import-wizard'

export const dynamic = 'force-dynamic'

export default async function CandidateImportPage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    const jobs = await getActiveJobs()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={ROUTES.ADMIN.CANDIDATES}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <AdminPageHeader
                    title="Import Candidates"
                    description="Bulk import candidates from a CSV file"
                />
            </div>

            <ImportWizard jobs={jobs} />
        </div>
    )
}
