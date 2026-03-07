'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { RankGrade } from '@prisma/client'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { rankGradeFormSchema, type RankGradeFormData } from '@/lib/admin/validations/rank-grade'
import { createRankGrade, updateRankGrade } from '@/lib/admin/actions/rank-grades'
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

interface GradeFormProps {
    grade?: RankGrade | null
}

export function GradeForm({ grade }: GradeFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = React.useTransition()

    const form = useForm<RankGradeFormData>({
        resolver: zodResolver(rankGradeFormSchema),
        defaultValues: {
            name: grade?.name || '',
            code: grade?.code || '',
            level: grade?.level || 1,
            description: grade?.description || '',
            minSalary: grade?.minSalary || undefined,
            maxSalary: grade?.maxSalary || undefined,
            isActive: grade?.isActive ?? true,
        },
    })

    // Auto-generate code from name for new grades
    const watchName = form.watch('name')
    React.useEffect(() => {
        if (!grade && watchName) {
            const generatedCode = watchName
                .toUpperCase()
                .replace(/[^A-Z0-9]+/g, '_')
                .replace(/^_+|_+$/g, '')
                .slice(0, 20)
            form.setValue('code', generatedCode, { shouldValidate: true })
        }
    }, [watchName, grade, form])

    async function onSubmit(data: RankGradeFormData) {
        startTransition(async () => {
            try {
                if (grade) {
                    await updateRankGrade(grade.id, data)
                    toast.success('Rank grade updated successfully')
                } else {
                    await createRankGrade(data)
                    toast.success('Rank grade created successfully')
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
                        <CardTitle>Grade Details</CardTitle>
                        <CardDescription>
                            Define the rank/grade information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Senior Level" {...field} />
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
                                                placeholder="e.g. SENIOR"
                                                {...field}
                                                className="uppercase"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="level"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Level</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="99"
                                                placeholder="1"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Numeric ranking (1 = entry, higher = senior)
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
                                            placeholder="Describe this grade level..."
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

                <Card>
                    <CardHeader>
                        <CardTitle>Salary Range</CardTitle>
                        <CardDescription>
                            Optional: Define salary range for this grade
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="minSalary"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Minimum Salary</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 60000"
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
                                name="maxSalary"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Maximum Salary</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 90000"
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

                <Card>
                    <CardContent className="pt-6">
                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Active</FormLabel>
                                        <FormDescription>
                                            Inactive grades won&apos;t appear in dropdowns
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
                        onClick={() => router.push(ROUTES.ADMIN.MASTER_DATA.RANK_GRADES)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {grade ? 'Update Grade' : 'Create Grade'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
