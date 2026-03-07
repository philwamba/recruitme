'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { PipelineTemplate, PipelineTemplateStage } from '@prisma/client'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    pipelineTemplateFormSchema,
    type PipelineTemplateFormData,
} from '@/lib/admin/validations/pipeline-template'
import {
    createPipelineTemplate,
    updatePipelineTemplate,
} from '@/lib/admin/actions/pipeline-templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
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

type TemplateWithStages = PipelineTemplate & {
    stages: PipelineTemplateStage[]
}

interface PipelineTemplateFormProps {
    template?: TemplateWithStages | null
}

const defaultStages: StageItem[] = [
    { id: 'new-1', name: 'Applied', order: 1, isDefault: true },
    { id: 'new-2', name: 'Under Review', order: 2, isDefault: false },
    { id: 'new-3', name: 'Interview', order: 3, isDefault: false },
    { id: 'new-4', name: 'Offer', order: 4, isDefault: false },
    { id: 'new-5', name: 'Hired', order: 5, isDefault: false },
]

export function PipelineTemplateForm({ template }: PipelineTemplateFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = React.useTransition()

    const form = useForm<PipelineTemplateFormData>({
        resolver: zodResolver(pipelineTemplateFormSchema),
        defaultValues: {
            name: template?.name || '',
            description: template?.description || '',
            isDefault: template?.isDefault ?? false,
            isActive: template?.isActive ?? true,
            stages: template?.stages.map(s => ({
                id: s.id,
                name: s.name,
                order: s.order,
                isDefault: s.isDefault,
            })) || defaultStages,
        },
    })

    async function onSubmit(data: PipelineTemplateFormData) {
        startTransition(async () => {
            try {
                if (template) {
                    await updatePipelineTemplate(template.id, data)
                } else {
                    await createPipelineTemplate(data)
                }
            } catch (error) {
                // Re-throw NEXT_REDIRECT errors so navigation works
                if (error && typeof error === 'object' && 'digest' in error) {
                    const digest = (error as { digest?: string }).digest
                    if (digest?.startsWith('NEXT_REDIRECT')) {
                        throw error
                    }
                }
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
                        <CardTitle>Template Details</CardTitle>
                        <CardDescription>
                            Configure the pipeline template settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Standard Hiring Pipeline"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe when to use this pipeline template..."
                                            className="min-h-[80px]"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="isDefault"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                Default Template
                                            </FormLabel>
                                            <FormDescription>
                                                Use for new jobs by default
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Active</FormLabel>
                                            <FormDescription>
                                                Available for selection
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pipeline Stages</CardTitle>
                        <CardDescription>
                            Define the stages candidates will progress through. Drag to reorder.
                            The starred stage is where new applications start.
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
                        onClick={() => router.push(ROUTES.ADMIN.CONFIG.PIPELINE_TEMPLATES)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {template ? 'Update Template' : 'Create Template'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
