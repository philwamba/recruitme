import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getPipelineTemplateById } from '@/lib/admin/queries/pipeline-templates'
import { AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { PipelineTemplateForm } from '../../_components/pipeline-template-form'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditPipelineTemplatePage({ params }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { id } = await params
    const template = await getPipelineTemplateById(id)

    if (!template) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Edit Pipeline Template"
                description={`Editing "${template.name}"`}
                actions={
                    <Button variant="ghost" asChild>
                        <Link href={ROUTES.ADMIN.CONFIG.PIPELINE_TEMPLATES}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Templates
                        </Link>
                    </Button>
                }
            />

            <PipelineTemplateForm template={template} />
        </div>
    )
}
