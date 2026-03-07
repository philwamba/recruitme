import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getQuestionnaires } from '@/lib/admin/queries/questionnaires'
import { AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { QuestionnairesTable } from './_components/questionnaires-table'

export const dynamic = 'force-dynamic'

export default async function QuestionnairesPage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_SYSTEM_SETTINGS',
    })

    const { questionnaires } = await getQuestionnaires()

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Questionnaires"
                description="Manage questionnaires for applications, interviews, and assessments"
                actions={
                    <Button asChild>
                        <Link href={`${ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES}/new`}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Questionnaire
                        </Link>
                    </Button>
                }
            />

            <QuestionnairesTable questionnaires={questionnaires} />
        </div>
    )
}
