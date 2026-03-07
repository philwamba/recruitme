'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { PipelineTemplate, PipelineTemplateStage } from '@prisma/client'
import { MoreHorizontal, Pencil, Trash2, Power, Star } from 'lucide-react'
import { toast } from 'sonner'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
    getFilteredRowModel,
} from '@tanstack/react-table'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DataTableColumnHeader } from '@/components/admin/data-table/data-table-column-header'
import {
    deletePipelineTemplate,
    togglePipelineTemplateStatus,
    setDefaultPipelineTemplate,
} from '@/lib/admin/actions/pipeline-templates'
import { ROUTES } from '@/lib/constants/routes'

type TemplateWithDetails = PipelineTemplate & {
    stages: PipelineTemplateStage[]
    _count: { jobs: number }
}

interface PipelineTemplatesTableProps {
    templates: TemplateWithDetails[]
}

export function PipelineTemplatesTable({ templates }: PipelineTemplatesTableProps) {
    const router = useRouter()
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState('')
    const [deleteId, setDeleteId] = React.useState<string | null>(null)
    const [isPending, startTransition] = React.useTransition()

    const columns: ColumnDef<TemplateWithDetails>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{row.getValue('name')}</span>
                    {row.original.isDefault && (
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => {
                const description = row.getValue('description') as string | null
                if (!description)
                    return <span className="text-muted-foreground">-</span>
                return (
                    <span className="line-clamp-1 max-w-[300px]">{description}</span>
                )
            },
        },
        {
            id: 'stages',
            header: 'Stages',
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.stages.length} stages</Badge>
            ),
        },
        {
            id: 'jobs',
            header: 'Jobs Using',
            cell: ({ row }) => row.original._count.jobs,
        },
        {
            accessorKey: 'isActive',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={row.getValue('isActive') ? 'default' : 'secondary'}>
                    {row.getValue('isActive') ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const template = row.original
                const hasJobs = template._count.jobs > 0

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`${ROUTES.ADMIN.CONFIG.PIPELINE_TEMPLATES}/${template.id}/edit`}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            {!template.isDefault && template.isActive && (
                                <DropdownMenuItem
                                    onClick={() => handleSetDefault(template.id)}
                                    disabled={isPending}
                                >
                                    <Star className="mr-2 h-4 w-4" />
                                    Set as Default
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={() => handleToggleStatus(template.id)}
                                disabled={isPending}
                            >
                                <Power className="mr-2 h-4 w-4" />
                                {template.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteId(template.id)}
                                disabled={hasJobs}
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

    const table = useReactTable({
        data: templates,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            globalFilter,
        },
    })

    function handleToggleStatus(id: string) {
        startTransition(async () => {
            try {
                await togglePipelineTemplateStatus(id)
                toast.success('Status updated')
                router.refresh()
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : 'Failed to update status',
                )
            }
        })
    }

    function handleSetDefault(id: string) {
        startTransition(async () => {
            try {
                await setDefaultPipelineTemplate(id)
                toast.success('Default template updated')
                router.refresh()
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : 'Failed to set default',
                )
            }
        })
    }

    function handleDelete() {
        if (!deleteId || isPending) return
        startTransition(async () => {
            try {
                await deletePipelineTemplate(deleteId)
                toast.success('Template deleted')
                setDeleteId(null)
                router.refresh()
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : 'Failed to delete',
                )
                setDeleteId(null)
            }
        })
    }

    return (
        <div className="space-y-4">
            <Input
                placeholder="Search templates..."
                value={globalFilter ?? ''}
                onChange={e => setGlobalFilter(e.target.value)}
                className="max-w-sm"
            />

            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No pipeline templates found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Pipeline Template</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this template? This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
