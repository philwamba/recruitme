'use client'

import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { MoreHorizontal, Eye, Pencil, Copy, Archive, Trash2 } from 'lucide-react'
import type { Job, Department, JobStatus } from '@prisma/client'
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
import { cn } from '@/lib/utils'

type JobWithRelations = Job & {
    department: Pick<Department, 'id' | 'name'> | null
    _count: {
        applications: number
    }
}

const statusStyles: Record<JobStatus, { label: string; className: string }> = {
    DRAFT: {
        label: 'Draft',
        className: 'bg-muted text-muted-foreground',
    },
    PUBLISHED: {
        label: 'Published',
        className: 'bg-success/10 text-success',
    },
    CLOSED: {
        label: 'Closed',
        className: 'bg-warning/10 text-warning',
    },
    ARCHIVED: {
        label: 'Archived',
        className: 'bg-muted text-muted-foreground',
    },
}

const columns: ColumnDef<JobWithRelations>[] = [
    {
        accessorKey: 'title',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Job Title" />
        ),
        cell: ({ row }) => {
            const job = row.original
            return (
                <div>
                    <Link
                        href={`${ROUTES.ADMIN.JOBS}/${job.id}`}
                        className="font-medium hover:underline"
                    >
                        {job.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
            )
        },
    },
    {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => {
            const department = row.original.department
            return department ? (
                <Badge variant="outline">{department.name}</Badge>
            ) : (
                <span className="text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status
            const style = statusStyles[status]
            return (
                <Badge className={cn('font-medium', style.className)}>
                    {style.label}
                </Badge>
            )
        },
    },
    {
        accessorKey: '_count.applications',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Applications" />
        ),
        cell: ({ row }) => {
            const count = row.original._count.applications
            return (
                <span className={cn(count > 0 ? 'font-medium' : 'text-muted-foreground')}>
                    {count}
                </span>
            )
        },
    },
    {
        accessorKey: 'publishedAt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Published" />
        ),
        cell: ({ row }) => {
            const publishedAt = row.original.publishedAt
            return publishedAt ? (
                <span className="text-sm">
                    {format(new Date(publishedAt), 'MMM d, yyyy')}
                </span>
            ) : (
                <span className="text-muted-foreground">-</span>
            )
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const job = row.original

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
                            <Link href={`${ROUTES.ADMIN.JOBS}/${job.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`${ROUTES.ADMIN.JOBS}/${job.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

interface JobsTableProps {
    jobs: JobWithRelations[]
}

export function JobsTable({ jobs }: JobsTableProps) {
    return (
        <DataTable
            columns={columns}
            data={jobs}
            searchKey="title"
            searchPlaceholder="Search jobs..."
        />
    )
}
