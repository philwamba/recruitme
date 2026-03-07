import { notFound } from 'next/navigation'
import { requireCurrentUser } from '@/lib/auth'
import { getQuestionnaireById } from '@/lib/admin/queries/questionnaires'
import { AdminPageHeader } from '@/components/admin'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants/routes'
import { QuestionnaireForm } from '../../_components/questionnaire-form'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditQuestionnairePage({ params }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_SYSTEM_SETTINGS',
    })

    const { id } = await params
    const questionnaire = await getQuestionnaireById(id)

    if (!questionnaire) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Edit Questionnaire"
                description={`Update ${questionnaire.name}`}
                backHref={`${ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES}/${id}`}
                backLabel="Back to Questionnaire"
            />

            <Card>
                <CardContent className="pt-6">
                    <QuestionnaireForm questionnaire={questionnaire} />
                </CardContent>
            </Card>
        </div>
    )
}
