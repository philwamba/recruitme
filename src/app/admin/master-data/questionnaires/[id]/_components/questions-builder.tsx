'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { QuestionnaireQuestion, QuestionType } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { questionTypes } from '@/lib/admin/validations/questionnaire'
import { deleteQuestion, reorderQuestions } from '@/lib/admin/actions/questionnaires'
import { QuestionFormDialog } from './question-form-dialog'

interface QuestionsBuilderProps {
    questionnaireId: string
    questions: QuestionnaireQuestion[]
}

export function QuestionsBuilder({ questionnaireId, questions }: QuestionsBuilderProps) {
    const [editingQuestion, setEditingQuestion] = useState<QuestionnaireQuestion | null>(null)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
    const [isReordering, setIsReordering] = useState(false)

    const handleToggleExpand = (questionId: string) => {
        setExpandedQuestions(prev => {
            const next = new Set(prev)
            if (next.has(questionId)) {
                next.delete(questionId)
            } else {
                next.add(questionId)
            }
            return next
        })
    }

    const handleMoveUp = async (index: number) => {
        if (index === 0 || isReordering) return
        setIsReordering(true)
        try {
            const newOrder = [...questions]
            const [moved] = newOrder.splice(index, 1)
            newOrder.splice(index - 1, 0, moved)
            await reorderQuestions(questionnaireId, newOrder.map(q => q.id))
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to reorder')
        } finally {
            setIsReordering(false)
        }
    }

    const handleMoveDown = async (index: number) => {
        if (index === questions.length - 1 || isReordering) return
        setIsReordering(true)
        try {
            const newOrder = [...questions]
            const [moved] = newOrder.splice(index, 1)
            newOrder.splice(index + 1, 0, moved)
            await reorderQuestions(questionnaireId, newOrder.map(q => q.id))
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to reorder')
        } finally {
            setIsReordering(false)
        }
    }

    const handleDelete = async (question: QuestionnaireQuestion) => {
        if (!confirm(`Are you sure you want to delete this question?\n\n"${question.text}"`)) {
            return
        }
        try {
            await deleteQuestion(question.id)
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to delete')
        }
    }

    const getTypeLabel = (type: QuestionType) => {
        return questionTypes.find(t => t.value === type)?.label ?? type
    }

    const getOptionsPreview = (question: QuestionnaireQuestion) => {
        if (!question.options || !Array.isArray(question.options)) return null
        const options = question.options as { value: string; label: string }[]
        if (options.length === 0) return null
        return options.map(o => o.label).join(', ')
    }

    return (
        <div className="space-y-4">
            {questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-4">No questions yet. Add your first question to get started.</p>
                    <Button onClick={() => setShowAddDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                    </Button>
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        {questions.map((question, index) => (
                            <Collapsible
                                key={question.id}
                                open={expandedQuestions.has(question.id)}
                                onOpenChange={() => handleToggleExpand(question.id)}
                            >
                                <div className="border rounded-lg">
                                    <div className="flex items-center gap-2 p-3">
                                        <div className="flex flex-col gap-0.5">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5"
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    handleMoveUp(index)
                                                }}
                                                disabled={index === 0 || isReordering}
                                                aria-label="Move question up"
                                            >
                                                <ChevronUp className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5"
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    handleMoveDown(index)
                                                }}
                                                disabled={index === questions.length - 1 || isReordering}
                                                aria-label="Move question down"
                                            >
                                                <ChevronDown className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        <span className="text-sm font-medium text-muted-foreground w-6">
                                            {index + 1}.
                                        </span>

                                        <CollapsibleTrigger asChild>
                                            <button className="flex-1 text-left">
                                                <span className="text-sm font-medium line-clamp-1">
                                                    {question.text}
                                                </span>
                                            </button>
                                        </CollapsibleTrigger>

                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {getTypeLabel(question.type)}
                                            </Badge>
                                            {question.isRequired && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Required
                                                </Badge>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    setEditingQuestion(question)
                                                }}
                                                aria-label="Edit question"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive"
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    handleDelete(question)
                                                }}
                                                aria-label="Delete question"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <CollapsibleContent>
                                        <div className="px-3 pb-3 pt-0 border-t">
                                            <div className="pt-3 space-y-2 text-sm">
                                                {question.helpText && (
                                                    <div>
                                                        <span className="text-muted-foreground">Help text: </span>
                                                        {question.helpText}
                                                    </div>
                                                )}
                                                {getOptionsPreview(question) && (
                                                    <div>
                                                        <span className="text-muted-foreground">Options: </span>
                                                        {getOptionsPreview(question)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CollapsibleContent>
                                </div>
                            </Collapsible>
                        ))}
                    </div>

                    <Button onClick={() => setShowAddDialog(true)} variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                    </Button>
                </>
            )}

            {/* Add Question Dialog */}
            <QuestionFormDialog
                questionnaireId={questionnaireId}
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                nextSortOrder={questions.length}
            />

            {/* Edit Question Dialog */}
            {editingQuestion && (
                <QuestionFormDialog
                    questionnaireId={questionnaireId}
                    question={editingQuestion}
                    open={!!editingQuestion}
                    onOpenChange={open => {
                        if (!open) setEditingQuestion(null)
                    }}
                    nextSortOrder={editingQuestion.sortOrder}
                />
            )}
        </div>
    )
}
