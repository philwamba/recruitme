import { Suspense } from 'react'
import { UserRole } from '@prisma/client'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateUserRole } from '@/app/actions/admin'
import { AdminPageHeader, TableSkeleton } from '@/components/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

async function handleUpdateRole(formData: FormData) {
    'use server'
    await updateUserRole(formData)
}

export default async function AdminUsersPage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_USERS',
    })

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Users"
                description="Manage user accounts and role assignments"
            />

            <Suspense fallback={<TableSkeleton columns={5} rows={10} showAvatar />}>
                <UsersSection />
            </Suspense>
        </div>
    )
}

async function UsersSection() {
    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: {
                    applications: true,
                    jobsCreated: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
    })

    const roleColors: Record<UserRole, string> = {
        ADMIN: 'bg-primary/10 text-primary',
        EMPLOYER: 'bg-info/10 text-info',
        APPLICANT: 'bg-muted text-muted-foreground',
    }

    return (
        <div className="space-y-4">
            {users.map(user => (
                <Card key={user.id}>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {user.email.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{user.email}</p>
                                        <Badge className={roleColors[user.role]}>
                                            {user.role}
                                        </Badge>
                                        {user.emailVerified && (
                                            <Badge variant="outline" className="text-success border-success">
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Joined {format(new Date(user.createdAt), 'MMM d, yyyy')} •{' '}
                                        {user._count.applications} applications •{' '}
                                        {user._count.jobsCreated} jobs created
                                    </p>
                                </div>
                            </div>
                            <form action={handleUpdateRole} className="flex items-center gap-2">
                                <input type="hidden" name="userId" value={user.id} />
                                <Select name="role" defaultValue={user.role}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(UserRole).map(role => (
                                            <SelectItem key={role} value={role}>
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="submit" variant="outline" size="sm">
                                    Update
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
