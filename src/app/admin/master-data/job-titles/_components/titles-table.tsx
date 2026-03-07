'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { JobTitle, JobCategory, RankGrade } from '@prisma/client'
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
import { deleteJobTitle, toggleJobTitleStatus } from '@/lib/admin/actions/job-titles'
import { ROUTES } from '@/lib/constants/routes'

type TitleWithRelations = JobTitle & {
    category: { id: string; name: string; code: string }
    rankGrade: { id: string; name: string; code: string; level: number } | null
    _count: { jobs: number }
}

interface TitlesTableProps {
    titles: TitleWithRelations[]
}

export function TitlesTable({ titles }: TitlesTableProps) {
    const router = useRouter()
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState('')
    const [deleteId, setDeleteId] = React.useState<string | null>(null)
    const [isPending, startTransition] = React.useTransition()

    const columns: ColumnDef<TitleWithRelations>[] = [
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
            id: 'category',
            header: 'Category',
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.category.name}</Badge>
            ),
        },
        {
            id: 'rankGrade',
            header: 'Rank/Grade',
            cell: ({ row }) =>
                row.original.rankGrade ? (
                    <span className="text-sm">
                        {row.original.rankGrade.name} (L{row.original.rankGrade.level})
                    </span>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            id: 'jobs',
            header: 'Jobs',
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
                const title = row.original
                const hasJobs = title._count.jobs > 0

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
                                <Link href={`${ROUTES.ADMIN.MASTER_DATA.JOB_TITLES}/${title.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleToggleStatus(title.id)}
                                disabled={isPending}
                            >
                                <Power className="mr-2 h-4 w-4" />
                                {title.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteId(title.id)}
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
        data: titles,
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
                await toggleJobTitleStatus(id)
                toast.success('Status updated')
                router.refresh()
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to update status')
            }
        })
    }

    function handleDelete() {
        if (!deleteId || isPending) return
        startTransition(async () => {
            try {
                await deleteJobTitle(deleteId)
                toast.success('Job title deleted')
                setDeleteId(null)
                router.refresh()
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to delete')
                setDeleteId(null)
            }
        })
    }

    return (
        <div className="space-y-4">
            <Input
                placeholder="Search job titles..."
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
                                    No job titles found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Job Title</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this job title? This action cannot be
                            undone.
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
