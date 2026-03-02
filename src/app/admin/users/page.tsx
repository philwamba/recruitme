import { UserRole } from '@prisma/client'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateUserRole } from '@/app/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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

    const users = await prisma.user.findMany({
        include: {
            applicantProfile: true,
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

    return (
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">User & Role Management</h1>
                <p className="text-muted-foreground">
          Review registered accounts and update role assignments for platform access.
                </p>
            </div>

            <div className="grid gap-4">
                {users.map(user => (
                    <Card key={user.id}>
                        <CardHeader>
                            <CardTitle>{user.email}</CardTitle>
                            <CardDescription>
                Created {new Date(user.createdAt).toLocaleDateString()} • Applications:{' '}
                                {user._count.applications} • Jobs: {user._count.jobsCreated}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="text-sm text-muted-foreground">
                Profile: {user.applicantProfile ? 'Available' : 'Not created'} • Verified:{' '}
                                {user.emailVerified ? 'Yes' : 'No'}
                            </div>
                            <form action={handleUpdateRole} className="flex gap-2">
                                <input type="hidden" name="userId" value={user.id} />
                                <select
                                    name="role"
                                    defaultValue={user.role}
                                    className="rounded-md border px-3 py-2 text-sm"
                                >
                                    {Object.values(UserRole).map(role => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                                <Button type="submit" variant="outline">
                  Update Role
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
