'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Job, Department, PipelineTemplate, PipelineTemplateStage } from '@prisma/client'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { jobFormSchema, type JobFormData } from '@/lib/admin/validations/job'
import { createJob, updateJob } from '@/lib/admin/actions/jobs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants/routes'

type TemplateWithStages = PipelineTemplate & {
    stages: PipelineTemplateStage[]
}

interface JobFormProps {
    job?: Job | null
    departments: Department[]
    pipelineTemplates?: TemplateWithStages[]
}

const employmentTypes = [
    { value: 'FULL_TIME', label: 'Full-time' },
    { value: 'PART_TIME', label: 'Part-time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'TEMPORARY', label: 'Temporary' },
]

const workplaceTypes = [
    { value: 'REMOTE', label: 'Remote' },
    { value: 'HYBRID', label: 'Hybrid' },
    { value: 'ONSITE', label: 'On-site' },
]

export function JobForm({ job, departments, pipelineTemplates = [] }: JobFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = React.useTransition()
    const isEditing = !!job

    const defaultTemplate = pipelineTemplates.find(t => t.isDefault)

    const form = useForm<JobFormData>({
        resolver: zodResolver(jobFormSchema),
        defaultValues: {
            title: job?.title || '',
            company: job?.company || '',
            location: job?.location || '',
            description: job?.description || '',
            requirements: job?.requirements || '',
            benefits: job?.benefits || '',
            salaryMin: job?.salaryMin || undefined,
            salaryMax: job?.salaryMax || undefined,
            salaryCurrency: job?.salaryCurrency || 'USD',
            employmentType: job?.employmentType || 'FULL_TIME',
            workplaceType: job?.workplaceType || 'ONSITE',
            departmentId: job?.departmentId || '',
            pipelineTemplateId: job?.pipelineTemplateId || defaultTemplate?.id || '',
            status: job?.status || 'DRAFT',
        },
    })

    async function onSubmit(data: JobFormData) {
        startTransition(async () => {
            try {
                if (job) {
                    await updateJob(job.id, data)
                    toast.success('Job updated successfully')
                } else {
                    await createJob(data)
                    toast.success('Job created successfully')
                }
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Something went wrong')
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                            Enter the core details about this position
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Job Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Senior Software Engineer" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Company</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Acme Inc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. San Francisco, CA"
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="departmentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value || ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {departments.map(dept => (
                                                    <SelectItem key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="employmentType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Employment Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {employmentTypes.map(type => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="workplaceType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Workplace Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {workplaceTypes.map(type => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {!isEditing && pipelineTemplates.length > 0 && (
                            <FormField
                                control={form.control}
                                name="pipelineTemplateId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pipeline Template</FormLabel>
                                        <Select
                                            onValueChange={val =>
                                                field.onChange(val === '__DEFAULT__' ? '' : val)
                                            }
                                            value={field.value || '__DEFAULT__'}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select pipeline template" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="__DEFAULT__">
                                                    Use default stages
                                                </SelectItem>
                                                {pipelineTemplates.map(template => (
                                                    <SelectItem key={template.id} value={template.id}>
                                                        {template.name}
                                                        {template.isDefault && ' (Default)'}
                                                        {' - '}
                                                        {template.stages.length} stages
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Choose which pipeline stages to use for this job.
                                            You can customize stages after creation.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Salary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Compensation</CardTitle>
                        <CardDescription>
                            Optional: Set salary range for this position
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 sm:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="salaryCurrency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value || 'USD'}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Currency" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                                <SelectItem value="GBP">GBP</SelectItem>
                                                <SelectItem value="CAD">CAD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="salaryMin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Minimum</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 80000"
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="salaryMax"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Maximum</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 120000"
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Description */}
                <Card>
                    <CardHeader>
                        <CardTitle>Job Description</CardTitle>
                        <CardDescription>
                            Describe the role, responsibilities, and what makes it great
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the role and responsibilities..."
                                            className="min-h-[200px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        You can use HTML for formatting
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="requirements"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Requirements</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="List the required skills and qualifications..."
                                            className="min-h-[150px]"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="benefits"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Benefits</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="List the benefits and perks..."
                                            className="min-h-[100px]"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(ROUTES.ADMIN.JOBS)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {job ? 'Update Job' : 'Create Job'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
