'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { JobCategory } from '@prisma/client'
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
import { deleteJobCategory, toggleJobCategoryStatus } from '@/lib/admin/actions/job-categories'
import { ROUTES } from '@/lib/constants/routes'

type CategoryWithCounts = JobCategory & {
    _count: {
        jobTitles: number
        jobs: number
    }
}

interface CategoriesTableProps {
    categories: CategoryWithCounts[]
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
    const router = useRouter()
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState('')
    const [deleteId, setDeleteId] = React.useState<string | null>(null)
    const [isPending, startTransition] = React.useTransition()

    const columns: ColumnDef<CategoryWithCounts>[] = [
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
            accessorKey: 'sortOrder',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
            cell: ({ row }) => row.getValue('sortOrder'),
        },
        {
            id: 'jobTitles',
            header: 'Job Titles',
            cell: ({ row }) => row.original._count.jobTitles,
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
                const category = row.original
                const hasRelations = category._count.jobTitles > 0 || category._count.jobs > 0

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
                                <Link href={`${ROUTES.ADMIN.MASTER_DATA.JOB_CATEGORIES}/${category.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleToggleStatus(category.id)}
                                disabled={isPending}
                            >
                                <Power className="mr-2 h-4 w-4" />
                                {category.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteId(category.id)}
                                disabled={hasRelations}
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
        data: categories,
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
                await toggleJobCategoryStatus(id)
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
                await deleteJobCategory(deleteId)
                toast.success('Category deleted')
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
                placeholder="Search categories..."
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
                                                header.getContext(),
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
                                    No categories found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this category? This action cannot be
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
