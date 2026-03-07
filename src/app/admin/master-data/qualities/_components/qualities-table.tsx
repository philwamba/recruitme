'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Quality } from '@prisma/client'
import { MoreHorizontal, Pencil, Trash2, Power } from 'lucide-react'
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
import { deleteQuality, toggleQualityStatus } from '@/lib/admin/actions/qualities'
import { ROUTES } from '@/lib/constants/routes'

type QualityWithCounts = Quality & {
    _count: { templateItems: number }
}

interface QualitiesTableProps {
    qualities: QualityWithCounts[]
}

const categoryLabels: Record<string, string> = {
    TECHNICAL: 'Technical',
    BEHAVIORAL: 'Behavioral',
    LEADERSHIP: 'Leadership',
    COMMUNICATION: 'Communication',
    PROBLEM_SOLVING: 'Problem Solving',
    TEAMWORK: 'Teamwork',
    OTHER: 'Other',
}

export function QualitiesTable({ qualities }: QualitiesTableProps) {
    const router = useRouter()
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState('')
    const [deleteId, setDeleteId] = React.useState<string | null>(null)
    const [isPending, startTransition] = React.useTransition()

    const columns: ColumnDef<QualityWithCounts>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue('name')}</div>
            ),
        },
        {
            accessorKey: 'code',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
            cell: ({ row }) => (
                <code className="rounded bg-muted px-2 py-1 text-sm">
                    {row.getValue('code')}
                </code>
            ),
        },
        {
            accessorKey: 'category',
            header: 'Category',
            cell: ({ row }) => {
                const category = row.getValue('category') as string | null
                if (!category) return <span className="text-muted-foreground">—</span>
                return (
                    <Badge variant="outline">
                        {categoryLabels[category] || category}
                    </Badge>
                )
            },
        },
        {
            id: 'templates',
            header: 'Templates',
            cell: ({ row }) => row.original._count.templateItems,
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
                const quality = row.original
                const hasTemplates = quality._count.templateItems > 0

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
                                <Link href={`${ROUTES.ADMIN.MASTER_DATA.QUALITIES}/${quality.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleToggleStatus(quality.id)}
                                disabled={isPending}
                            >
                                <Power className="mr-2 h-4 w-4" />
                                {quality.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteId(quality.id)}
                                disabled={hasTemplates}
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
        data: qualities,
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
                await toggleQualityStatus(id)
                toast.success('Status updated')
                router.refresh()
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to update status')
            }
        })
    }

    function handleDelete() {
        if (!deleteId) return
        startTransition(async () => {
            try {
                await deleteQuality(deleteId)
                toast.success('Quality deleted')
                setDeleteId(null)
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to delete')
                setDeleteId(null)
            }
        })
    }

    return (
        <div className="space-y-4">
            <Input
                placeholder="Search qualities..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm"
            />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
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
                                    No qualities found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quality</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this quality? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
