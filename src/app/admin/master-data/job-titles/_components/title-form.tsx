'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { JobTitle, JobCategory, RankGrade } from '@prisma/client'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { jobTitleFormSchema, type JobTitleFormData } from '@/lib/admin/validations/job-title'
import { createJobTitle, updateJobTitle } from '@/lib/admin/actions/job-titles'
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants/routes'

interface TitleFormProps {
    title?: (JobTitle & { category: JobCategory; rankGrade: RankGrade | null }) | null
    categories: JobCategory[]
    rankGrades: RankGrade[]
}

export function TitleForm({ title, categories, rankGrades }: TitleFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = React.useTransition()

    const form = useForm<JobTitleFormData>({
        resolver: zodResolver(jobTitleFormSchema),
        defaultValues: {
            name: title?.name || '',
            code: title?.code || '',
            categoryId: title?.categoryId || '',
            description: title?.description || '',
            rankGradeId: title?.rankGradeId || '',
            isActive: title?.isActive ?? true,
        },
    })

    // Auto-generate code from name for new titles
    const watchName = form.watch('name')
    React.useEffect(() => {
        if (!title && watchName) {
            const generatedCode = watchName
                .toUpperCase()
                .replace(/[^A-Z0-9]+/g, '_')
                .replace(/^_+|_+$/g, '')
                .slice(0, 20)
            form.setValue('code', generatedCode, { shouldValidate: true })
        }
    }, [watchName, title, form])

    async function onSubmit(data: JobTitleFormData) {
        startTransition(async () => {
            try {
                if (title) {
                    await updateJobTitle(title.id, data)
                    toast.success('Job title updated successfully')
                } else {
                    await createJobTitle(data)
                    toast.success('Job title created successfully')
                }
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Something went wrong')
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Job Title Details</CardTitle>
                        <CardDescription>
                            Define the job title information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Senior Software Engineer" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Code</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. SR_SOFTWARE_ENG"
                                                {...field}
                                                className="uppercase"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Unique identifier (uppercase, no spaces)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        {cat.name}
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
                                name="rankGradeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rank/Grade</FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(val === '__NONE__' ? '' : val)}
                                            value={field.value || '__NONE__'}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select rank grade (optional)" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="__NONE__">None</SelectItem>
                                                {rankGrades.map((grade) => (
                                                    <SelectItem key={grade.id} value={grade.id}>
                                                        {grade.name} (Level {grade.level})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Associate with a salary grade
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe this job title..."
                                            className="min-h-[100px]"
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
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Active</FormLabel>
                                        <FormDescription>
                                            Inactive titles won&apos;t appear in dropdowns
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
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(ROUTES.ADMIN.MASTER_DATA.JOB_TITLES)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {title ? 'Update Title' : 'Create Title'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
