'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { JobPipelineStage } from '@prisma/client'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    jobPipelineFormSchema,
    type JobPipelineFormData,
} from '@/lib/admin/validations/job-pipeline'
import { updateJobPipeline } from '@/lib/admin/actions/job-pipeline'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    SortableStagesList,
    type StageItem,
} from '@/components/admin/sortable-stages-list'
import { ROUTES } from '@/lib/constants/routes'

interface JobPipelineFormProps {
    jobId: string
    jobTitle: string
    stages: JobPipelineStage[]
}

export function JobPipelineForm({ jobId, jobTitle, stages }: JobPipelineFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = React.useTransition()

    const form = useForm<JobPipelineFormData>({
        resolver: zodResolver(jobPipelineFormSchema),
        defaultValues: {
            stages: stages.map(s => ({
                id: s.id,
                name: s.name,
                order: s.order,
                isDefault: s.isDefault,
            })),
        },
    })

    async function onSubmit(data: JobPipelineFormData) {
        startTransition(async () => {
            try {
                await updateJobPipeline(jobId, data)
                toast.success('Pipeline updated successfully')
                router.push(`${ROUTES.ADMIN.PIPELINE}/${jobId}`)
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : 'Something went wrong',
                )
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pipeline Stages for &quot;{jobTitle}&quot;</CardTitle>
                        <CardDescription>
                            Customize the hiring pipeline stages for this job. Drag to
                            reorder. The starred stage is where new applications start.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="stages"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <SortableStagesList
                                            stages={field.value as StageItem[]}
                                            onChange={field.onChange}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`${ROUTES.ADMIN.PIPELINE}/${jobId}`)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    )
}
