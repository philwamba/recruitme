'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { EmploymentType, WorkplaceType } from '@prisma/client'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    jobRequestFormSchema,
    employmentTypes,
    workplaceTypes,
    type JobRequestFormData,
} from '@/lib/admin/validations/job-request'
import { createJobRequest, updateJobRequest } from '@/lib/admin/actions/job-requests'

interface OrganizationOption {
    id: string
    name: string
    code: string
}

interface CategoryOption {
    id: string
    name: string
}

interface JobRequestFormProps {
    jobRequest?: {
        id: string
        title: string
        organizationId: string
        categoryId: string | null
        headcount: number
        employmentType: EmploymentType
        workplaceType: WorkplaceType
        location: string | null
        justification: string
        requirements: string | null
        salaryMin: number | null
        salaryMax: number | null
        salaryCurrency: string | null
        targetStartDate: Date | null
    }
    organizations: OrganizationOption[]
    categories: CategoryOption[]
}

export function JobRequestForm({
    jobRequest,
    organizations,
    categories,
}: JobRequestFormProps) {
    const isEditing = !!jobRequest

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<JobRequestFormData>({
        resolver: zodResolver(jobRequestFormSchema),
        defaultValues: {
            title: jobRequest?.title ?? '',
            organizationId: jobRequest?.organizationId ?? '',
            categoryId: jobRequest?.categoryId ?? null,
            headcount: jobRequest?.headcount ?? 1,
            employmentType: jobRequest?.employmentType ?? 'FULL_TIME',
            workplaceType: jobRequest?.workplaceType ?? 'ON_SITE',
            location: jobRequest?.location ?? '',
            justification: jobRequest?.justification ?? '',
            requirements: jobRequest?.requirements ?? '',
            salaryMin: jobRequest?.salaryMin ?? null,
            salaryMax: jobRequest?.salaryMax ?? null,
            salaryCurrency: jobRequest?.salaryCurrency ?? 'USD',
            targetStartDate: jobRequest?.targetStartDate
                ? jobRequest.targetStartDate.toISOString().split('T')[0]
                : null,
        },
    })

    const currentEmploymentType = watch('employmentType')
    const currentWorkplaceType = watch('workplaceType')

    const onSubmit = async (data: JobRequestFormData) => {
        try {
            if (isEditing) {
                await updateJobRequest(jobRequest.id, data)
            } else {
                await createJobRequest(data)
            }
        } catch (error) {
            alert(error instanceof Error ? error.message : 'An error occurred')
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                        id="title"
                        {...register('title')}
                        placeholder="e.g., Senior Software Engineer"
                    />
                    {errors.title && (
                        <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="organizationId">Department/Organization *</Label>
                    <Select
                        value={watch('organizationId')}
                        onValueChange={value => setValue('organizationId', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                        <SelectContent>
                            {organizations.map(org => (
                                <SelectItem key={org.id} value={org.id}>
                                    {org.name} ({org.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.organizationId && (
                        <p className="text-sm text-destructive">{errors.organizationId.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="categoryId">Job Category</Label>
                    <Select
                        value={watch('categoryId') ?? '__none__'}
                        onValueChange={value => setValue('categoryId', value === '__none__' ? null : value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__none__">No category</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="headcount">Number of Positions *</Label>
                    <Input
                        id="headcount"
                        type="number"
                        min={1}
                        max={100}
                        {...register('headcount')}
                    />
                    {errors.headcount && (
                        <p className="text-sm text-destructive">{errors.headcount.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="targetStartDate">Target Start Date</Label>
                    <Input
                        id="targetStartDate"
                        type="date"
                        {...register('targetStartDate')}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="employmentType">Employment Type *</Label>
                    <Select
                        value={currentEmploymentType}
                        onValueChange={value => setValue('employmentType', value as EmploymentType)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {employmentTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="workplaceType">Workplace Type *</Label>
                    <Select
                        value={currentWorkplaceType}
                        onValueChange={value => setValue('workplaceType', value as WorkplaceType)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {workplaceTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        {...register('location')}
                        placeholder="e.g., New York, NY"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="salaryMin">Minimum Salary</Label>
                    <Input
                        id="salaryMin"
                        type="number"
                        min={0}
                        {...register('salaryMin')}
                        placeholder="e.g., 50000"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="salaryMax">Maximum Salary</Label>
                    <Input
                        id="salaryMax"
                        type="number"
                        min={0}
                        {...register('salaryMax')}
                        placeholder="e.g., 80000"
                    />
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="justification">Justification *</Label>
                    <Textarea
                        id="justification"
                        {...register('justification')}
                        placeholder="Explain why this position is needed, the business impact, and any relevant context..."
                        rows={4}
                    />
                    {errors.justification && (
                        <p className="text-sm text-destructive">{errors.justification.message}</p>
                    )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                        id="requirements"
                        {...register('requirements')}
                        placeholder="List the required skills, qualifications, and experience..."
                        rows={4}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Update Request' : 'Create Request'}
                </Button>
            </div>
        </form>
    )
}
