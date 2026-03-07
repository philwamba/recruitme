import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { PipelineTemplateForm } from '../_components/pipeline-template-form'

export default async function NewPipelineTemplatePage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="New Pipeline Template"
                description="Create a new reusable pipeline configuration"
                actions={
                    <Button variant="ghost" asChild>
                        <Link href={ROUTES.ADMIN.CONFIG.PIPELINE_TEMPLATES}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Templates
                        </Link>
                    </Button>
                }
            />

            <PipelineTemplateForm />
        </div>
    )
}
