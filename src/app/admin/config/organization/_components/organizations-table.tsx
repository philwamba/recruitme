'use client'

import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Edit, Trash2, Building2, Users, GitBranch } from 'lucide-react'
import type { OrganizationType } from '@prisma/client'
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
import { deleteOrganization } from '@/lib/admin/actions/organizations'

interface Organization {
    id: string
    name: string
    code: string
    type: OrganizationType
    isActive: boolean
    parent: {
        id: string
        name: string
        code: string
        type: OrganizationType
    } | null
    manager: {
        id: string
        email: string
    } | null
    _count: {
        children: number
        jobRequests: number
    }
}

const typeStyles: Record<OrganizationType, { label: string; className: string }> = {
    COMPANY: { label: 'Company', className: 'bg-purple-100 text-purple-800' },
    DIVISION: { label: 'Division', className: 'bg-blue-100 text-blue-800' },
    DEPARTMENT: { label: 'Department', className: 'bg-green-100 text-green-800' },
    TEAM: { label: 'Team', className: 'bg-yellow-100 text-yellow-800' },
    UNIT: { label: 'Unit', className: 'bg-gray-100 text-gray-800' },
}

const columns: ColumnDef<Organization>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => {
            const org = row.original
            return (
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <Link
                            href={`${ROUTES.ADMIN.CONFIG.ORGANIZATION}/${org.id}`}
                            className="font-medium hover:underline"
                        >
                            {org.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{org.code}</p>
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
        accessorKey: 'parent',
        header: 'Parent',
        cell: ({ row }) => {
            const parent = row.original.parent
            return parent ? (
                <div className="flex items-center gap-1 text-sm">
                    <GitBranch className="h-3 w-3 text-muted-foreground" />
                    {parent.name}
                </div>
            ) : (
                <span className="text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: 'manager',
        header: 'Manager',
        cell: ({ row }) => {
            const manager = row.original.manager
            return manager ? (
                <div className="flex items-center gap-1 text-sm">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    {manager.email}
                </div>
            ) : (
                <span className="text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: '_count.children',
        header: 'Children',
        cell: ({ row }) => row.original._count.children,
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
            const org = row.original

            const handleDelete = async () => {
                if (confirm('Are you sure you want to delete this organization?')) {
                    try {
                        await deleteOrganization(org.id)
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
                            <Link href={`${ROUTES.ADMIN.CONFIG.ORGANIZATION}/${org.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleDelete}
                            className="text-destructive"
                            disabled={org._count.children > 0}
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

interface OrganizationsTableProps {
    organizations: Organization[]
}

export function OrganizationsTable({ organizations }: OrganizationsTableProps) {
    return (
        <DataTable
            columns={columns}
            data={organizations}
            searchKey="name"
            searchPlaceholder="Search organizations..."
        />
    )
}
