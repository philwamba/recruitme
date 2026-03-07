'use client'

import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Edit, Trash2, FileQuestion, Eye } from 'lucide-react'
import type { QuestionnaireType } from '@prisma/client'
import { DataTable, DataTableColumnHeader } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/lib/constants/routes'
import { deleteQuestionnaire } from '@/lib/admin/actions/questionnaires'

interface Questionnaire {
    id: string
    name: string
    code: string
    description: string | null
    type: QuestionnaireType
    isActive: boolean
    _count: {
        questions: number
        responses: number
    }
}

const typeStyles: Record<QuestionnaireType, { label: string; className: string }> = {
    APPLICATION: { label: 'Application', className: 'bg-blue-100 text-blue-800' },
    SCREENING: { label: 'Screening', className: 'bg-purple-100 text-purple-800' },
    INTERVIEW: { label: 'Interview', className: 'bg-green-100 text-green-800' },
    ASSESSMENT: { label: 'Assessment', className: 'bg-yellow-100 text-yellow-800' },
    EXIT: { label: 'Exit', className: 'bg-red-100 text-red-800' },
    ONBOARDING: { label: 'Onboarding', className: 'bg-teal-100 text-teal-800' },
}

const columns: ColumnDef<Questionnaire>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => {
            const questionnaire = row.original
            return (
                <div className="flex items-center gap-2">
                    <FileQuestion className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <Link
                            href={`${ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES}/${questionnaire.id}`}
                            className="font-medium hover:underline"
                        >
                            {questionnaire.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{questionnaire.code}</p>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
            const type = row.original.type
            const style = typeStyles[type]
            return (
                <Badge variant="secondary" className={style.className}>
                    {style.label}
                </Badge>
            )
        },
    },
    {
        accessorKey: '_count.questions',
        header: 'Questions',
        cell: ({ row }) => row.original._count.questions,
    },
    {
        accessorKey: '_count.responses',
        header: 'Responses',
        cell: ({ row }) => row.original._count.responses,
    },
    {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
            <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
                {row.original.isActive ? 'Active' : 'Inactive'}
            </Badge>
        ),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const questionnaire = row.original

            const handleDelete = async () => {
                if (confirm('Are you sure you want to delete this questionnaire?')) {
                    try {
                        await deleteQuestionnaire(questionnaire.id)
                    } catch (error) {
                        alert(error instanceof Error ? error.message : 'Failed to delete')
                    }
                }
            }

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`${ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES}/${questionnaire.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View & Edit Questions
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`${ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES}/${questionnaire.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleDelete}
                            className="text-destructive"
                            disabled={questionnaire._count.responses > 0}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

interface QuestionnairesTableProps {
    questionnaires: Questionnaire[]
}

export function QuestionnairesTable({ questionnaires }: QuestionnairesTableProps) {
    return (
        <DataTable
            columns={columns}
            data={questionnaires}
            searchKey="name"
            searchPlaceholder="Search questionnaires..."
        />
    )
}
