'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { QuestionnaireQuestion, QuestionType } from '@prisma/client'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    questionFormSchema,
    questionTypes,
    type QuestionFormData,
} from '@/lib/admin/validations/questionnaire'
import { createQuestion, updateQuestion } from '@/lib/admin/actions/questionnaires'

interface QuestionFormDialogProps {
    questionnaireId: string
    question?: QuestionnaireQuestion
    open: boolean
    onOpenChange: (open: boolean) => void
    nextSortOrder: number
}

const TYPES_WITH_OPTIONS: QuestionType[] = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE']

export function QuestionFormDialog({
    questionnaireId,
    question,
    open,
    onOpenChange,
    nextSortOrder,
}: QuestionFormDialogProps) {
    const isEditing = !!question
    const [isSubmitting, setIsSubmitting] = useState(false)

    const defaultOptions = question?.options && Array.isArray(question.options)
        ? (question.options as { value: string; label: string }[])
        : [{ value: '', label: '' }]

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<QuestionFormData>({
        resolver: zodResolver(questionFormSchema),
        defaultValues: {
            text: question?.text ?? '',
            type: question?.type ?? 'TEXT',
            options: defaultOptions,
            isRequired: question?.isRequired ?? false,
            helpText: question?.helpText ?? '',
            sortOrder: question?.sortOrder ?? nextSortOrder,
        },
    })

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'options',
    })

    useEffect(() => {
        if (open) {
            const newOptions = question?.options && Array.isArray(question.options)
                ? (question.options as { value: string; label: string }[])
                : [{ value: '', label: '' }]

            reset({
                text: question?.text ?? '',
                type: question?.type ?? 'TEXT',
                options: newOptions,
                isRequired: question?.isRequired ?? false,
                helpText: question?.helpText ?? '',
                sortOrder: question?.sortOrder ?? nextSortOrder,
            })
            replace(newOptions)
        }
    }, [open, question?.id, reset, replace, question, nextSortOrder])

    const currentType = watch('type')
    const showOptions = TYPES_WITH_OPTIONS.includes(currentType)

    const onSubmit = async (data: QuestionFormData) => {
        setIsSubmitting(true)
        try {
            // Only include options for choice types
            const submitData = {
                ...data,
                options: showOptions ? data.options?.filter(o => o.value && o.label) : undefined,
            }

            if (isEditing) {
                await updateQuestion(question.id, submitData)
            } else {
                await createQuestion(questionnaireId, submitData)
            }
            onOpenChange(false)
            reset()
        } catch (error) {
            alert(error instanceof Error ? error.message : 'An error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAddOption = () => {
        append({ value: '', label: '' })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Question' : 'Add Question'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the question details'
                            : 'Create a new question for this questionnaire'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="text">Question Text *</Label>
                        <Textarea
                            id="text"
                            {...register('text')}
                            placeholder="Enter your question..."
                            rows={2}
                        />
                        {errors.text && (
                            <p className="text-sm text-destructive">{errors.text.message}</p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="type">Question Type *</Label>
                            <Select
                                value={currentType}
                                onValueChange={value => setValue('type', value as QuestionType)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {questionTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2 pt-6">
                            <Switch
                                id="isRequired"
                                checked={watch('isRequired')}
                                onCheckedChange={checked => setValue('isRequired', checked)}
                            />
                            <Label htmlFor="isRequired">Required</Label>
                        </div>
                    </div>

                    {showOptions && (
                        <div className="space-y-2">
                            <Label>Options *</Label>
                            <div className="space-y-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                        <Input
                                            {...register(`options.${index}.value`)}
                                            placeholder="Value"
                                            className="flex-1"
                                        />
                                        <Input
                                            {...register(`options.${index}.label`)}
                                            placeholder="Label"
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            disabled={fields.length <= 1}
                                            aria-label={`Remove option ${index + 1}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddOption}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Option
                            </Button>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="helpText">Help Text</Label>
                        <Input
                            id="helpText"
                            {...register('helpText')}
                            placeholder="Optional hint for respondents"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Update' : 'Add'} Question
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
