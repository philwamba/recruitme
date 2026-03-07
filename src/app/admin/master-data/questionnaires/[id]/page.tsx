import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Edit, FileQuestion, Plus } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getQuestionnaireById } from '@/lib/admin/queries/questionnaires'
import { AdminPageHeader } from '@/components/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { questionnaireTypes } from '@/lib/admin/validations/questionnaire'
import { QuestionsBuilder } from './_components/questions-builder'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function QuestionnaireDetailPage({ params }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_SYSTEM_SETTINGS',
    })

    const { id } = await params
    const questionnaire = await getQuestionnaireById(id)

    if (!questionnaire) {
        notFound()
    }

    const typeConfig = questionnaireTypes.find(t => t.value === questionnaire.type)

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title={questionnaire.name}
                description={questionnaire.code}
                backHref={ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES}
                backLabel="Back to Questionnaires"
                actions={
                    <Button variant="outline" asChild>
                        <Link href={`${ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES}/${id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                        </Link>
                    </Button>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content - Questions Builder */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Questions</CardTitle>
                                <CardDescription>
                                    Manage the questions in this questionnaire
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <QuestionsBuilder
                                questionnaireId={questionnaire.id}
                                questions={questionnaire.questions}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Questionnaire Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Type</span>
                                <Badge variant="secondary">{typeConfig?.label}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <Badge variant={questionnaire.isActive ? 'default' : 'secondary'}>
                                    {questionnaire.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Questions</span>
                                <span className="text-sm font-medium">{questionnaire.questions.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Responses</span>
                                <span className="text-sm font-medium">{questionnaire._count.responses}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    {questionnaire.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {questionnaire.description}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* View Responses */}
                    {questionnaire._count.responses > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Responses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`${ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES}/${id}/responses`}>
                                        <FileQuestion className="mr-2 h-4 w-4" />
                                        View Responses ({questionnaire._count.responses})
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
