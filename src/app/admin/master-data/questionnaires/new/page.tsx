import { requireCurrentUser } from '@/lib/auth'
import { AdminPageHeader } from '@/components/admin'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants/routes'
import { QuestionnaireForm } from '../_components/questionnaire-form'

export default async function NewQuestionnairePage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_SYSTEM_SETTINGS',
    })

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="New Questionnaire"
                description="Create a new questionnaire"
                backHref={ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES}
                backLabel="Back to Questionnaires"
            />

            <Card>
                <CardContent className="pt-6">
                    <QuestionnaireForm />
                </CardContent>
            </Card>
        </div>
    )
}
