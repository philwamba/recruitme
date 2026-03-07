'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { JobCategory } from '@prisma/client'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    jobCategoryFormSchema,
    type JobCategoryFormData,
} from '@/lib/admin/validations/job-category'
import { createJobCategory, updateJobCategory } from '@/lib/admin/actions/job-categories'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants/routes'

interface CategoryFormProps {
    category?: JobCategory | null
}

export function CategoryForm({ category }: CategoryFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = React.useTransition()

    const form = useForm<JobCategoryFormData>({
        resolver: zodResolver(jobCategoryFormSchema),
        defaultValues: {
            name: category?.name || '',
            code: category?.code || '',
            description: category?.description || '',
            isActive: category?.isActive ?? true,
            sortOrder: category?.sortOrder || 0,
        },
    })

    // Shared function to normalize code values
    const normalizeCode = React.useCallback((value: string) => {
        return value
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .slice(0, 20)
    }, [])

    // Auto-generate code from name for new categories (only when code is empty/pristine)
    const watchName = form.watch('name')
    React.useEffect(() => {
        const currentCode = form.getValues('code')
        if (!category && watchName && !currentCode) {
            form.setValue('code', normalizeCode(watchName), { shouldValidate: true })
        }
    }, [watchName, category, form, normalizeCode])

    async function onSubmit(data: JobCategoryFormData) {
        startTransition(async () => {
            try {
                if (category) {
                    await updateJobCategory(category.id, data)
                    toast.success('Category updated successfully')
                } else {
                    await createJobCategory(data)
                    toast.success('Category created successfully')
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
                        <CardTitle>Category Details</CardTitle>
                        <CardDescription>
                            Define the job category information
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
                                            <Input placeholder="e.g. Engineering" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Display name for this category
                                        </FormDescription>
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
                                                placeholder="e.g. ENGINEERING"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(normalizeCode(e.target.value))
                                                }}
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

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe this category..."
                                            className="min-h-[100px]"
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
                                name="sortOrder"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sort Order</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Lower numbers appear first
                                        </FormDescription>
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
                                                Inactive categories won&apos;t appear in dropdowns
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

                <div className="flex items-center justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(ROUTES.ADMIN.MASTER_DATA.JOB_CATEGORIES)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {category ? 'Update Category' : 'Create Category'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
