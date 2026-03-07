'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { QuestionnaireType } from '@prisma/client'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    questionnaireFormSchema,
    questionnaireTypes,
    type QuestionnaireFormData,
} from '@/lib/admin/validations/questionnaire'
import { createQuestionnaire, updateQuestionnaire } from '@/lib/admin/actions/questionnaires'

interface QuestionnaireFormProps {
    questionnaire?: {
        id: string
        name: string
        code: string
        description: string | null
        type: QuestionnaireType
        isActive: boolean
    }
}

export function QuestionnaireForm({ questionnaire }: QuestionnaireFormProps) {
    const isEditing = !!questionnaire

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<QuestionnaireFormData>({
        resolver: zodResolver(questionnaireFormSchema),
        defaultValues: {
            name: questionnaire?.name ?? '',
            code: questionnaire?.code ?? '',
            description: questionnaire?.description ?? '',
            type: questionnaire?.type ?? 'APPLICATION',
            isActive: questionnaire?.isActive ?? true,
        },
    })

    const currentType = watch('type')
    const isActive = watch('isActive')

    const onSubmit = async (data: QuestionnaireFormData) => {
        try {
            if (isEditing) {
                await updateQuestionnaire(questionnaire.id, data)
            } else {
                await createQuestionnaire(data)
            }
        } catch (error) {
            alert(error instanceof Error ? error.message : 'An error occurred')
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                        id="name"
                        {...register('name')}
                        placeholder="e.g., Software Engineer Application"
                    />
                    {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="code">Code *</Label>
                    <Input
                        id="code"
                        {...register('code')}
                        placeholder="e.g., SWE_APP"
                        className="uppercase"
                    />
                    {errors.code && (
                        <p className="text-sm text-destructive">{errors.code.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                        value={currentType}
                        onValueChange={value => setValue('type', value as QuestionnaireType)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {questionnaireTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.type && (
                        <p className="text-sm text-destructive">{errors.type.message}</p>
                    )}
                </div>

                <div className="flex items-center space-x-2 pt-6">
                    <Switch
                        id="isActive"
                        checked={isActive}
                        onCheckedChange={checked => setValue('isActive', checked)}
                    />
                    <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="Describe the purpose of this questionnaire..."
                        rows={3}
                    />
                    {errors.description && (
                        <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Update Questionnaire' : 'Create Questionnaire'}
                </Button>
            </div>
        </form>
    )
}
