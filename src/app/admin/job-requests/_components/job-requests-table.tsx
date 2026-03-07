'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Eye, Edit, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import type { JobRequestStatus, EmploymentType, WorkplaceType } from '@prisma/client'
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
import { cancelJobRequest, convertToJob } from '@/lib/admin/actions/job-requests'

interface JobRequest {
    id: string
    requestNumber: string
    title: string
    headcount: number
    employmentType: EmploymentType
    workplaceType: WorkplaceType
    status: JobRequestStatus
    createdAt: Date
    organization: {
        id: string
        name: string
        code: string
    }
    category: {
        id: string
        name: string
    } | null
    requestedBy: {
        id: string
        email: string
    }
    approvals: Array<{
        id: string
        level: number
        status: string
        approver: {
            id: string
            email: string
        }
    }>
    job: {
        id: string
        slug: string
        status: string
    } | null
}

const statusStyles: Record<JobRequestStatus, { label: string; className: string }> = {
    DRAFT: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
    PENDING_APPROVAL: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    APPROVED: { label: 'Approved', className: 'bg-green-100 text-green-800' },
    REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
    CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800' },
    CONVERTED: { label: 'Converted', className: 'bg-blue-100 text-blue-800' },
}

const columns: ColumnDef<JobRequest>[] = [
    {
        accessorKey: 'requestNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Request #" />,
        cell: ({ row }) => (
            <Link
                href={`${ROUTES.ADMIN.JOB_REQUESTS}/${row.original.id}`}
                className="font-mono text-sm hover:underline"
            >
                {row.original.requestNumber}
            </Link>
        ),
    },
    {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
        cell: ({ row }) => (
            <div>
                <Link
                    href={`${ROUTES.ADMIN.JOB_REQUESTS}/${row.original.id}`}
                    className="font-medium hover:underline"
                >
                    {row.original.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                    {row.original.organization.name}
                </p>
            </div>
        ),
    },
    {
        accessorKey: 'headcount',
        header: 'Positions',
        cell: ({ row }) => row.original.headcount,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status
            const style = statusStyles[status]
            return <Badge className={style.className}>{style.label}</Badge>
        },
    },
    {
        accessorKey: 'approvals',
        header: 'Approvals',
        cell: ({ row }) => {
            const approvals = row.original.approvals
            if (approvals.length === 0) return '-'

            const approved = approvals.filter(a => a.status === 'APPROVED').length
            const total = approvals.length

            return (
                <div className="flex items-center gap-1">
                    <span className="text-sm">
                        {approved}/{total}
                    </span>
                    {approved === total && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: 'requestedBy',
        header: 'Requested By',
        cell: ({ row }) => (
            <span className="text-sm">{row.original.requestedBy.email}</span>
        ),
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
        cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM d, yyyy'),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const request = row.original

            const handleCancel = async () => {
                if (confirm('Are you sure you want to cancel this request?')) {
                    try {
                        await cancelJobRequest(request.id)
                    } catch (error) {
                        alert(error instanceof Error ? error.message : 'Failed to cancel')
                    }
                }
            }

            const handleConvert = async () => {
                if (confirm('Convert this request to a job posting?')) {
                    try {
                        await convertToJob(request.id)
                    } catch (error) {
                        alert(error instanceof Error ? error.message : 'Failed to convert')
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
                            <Link href={`${ROUTES.ADMIN.JOB_REQUESTS}/${request.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        {(request.status === 'DRAFT' || request.status === 'REJECTED') && (
                            <DropdownMenuItem asChild>
                                <Link href={`${ROUTES.ADMIN.JOB_REQUESTS}/${request.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {request.status === 'APPROVED' && !request.job && (
                            <DropdownMenuItem onClick={handleConvert}>
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Convert to Job
                            </DropdownMenuItem>
                        )}
                        {request.status !== 'CONVERTED' &&
                            request.status !== 'CANCELLED' && (
                            <DropdownMenuItem
                                onClick={handleCancel}
                                className="text-destructive"
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

interface JobRequestsTableProps {
    jobRequests: JobRequest[]
}

export function JobRequestsTable({ jobRequests }: JobRequestsTableProps) {
    return (
        <DataTable
            columns={columns}
            data={jobRequests}
            searchKey="title"
            searchPlaceholder="Search requests..."
        />
    )
}
