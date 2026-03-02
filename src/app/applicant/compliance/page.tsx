import Link from 'next/link'
import { requestDataDeletion } from '@/app/actions/enterprise'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function ApplicantCompliancePage() {
    const user = await requireCurrentUser({
        roles: ['APPLICANT'],
        permission: 'MANAGE_SELF_PROFILE',
    })

    const requests = await prisma.dataDeletionRequest.findMany({
        where: { userId: user.id },
        orderBy: { requestedAt: 'desc' },
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Privacy & Compliance</h1>
                <p className="text-muted-foreground">
          Export your recruitment data or request deletion of your candidate record.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Request Data Deletion</CardTitle>
                        <CardDescription>Ask for your recruitment data to be removed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={requestDataDeletion} className="space-y-3">
                            <textarea
                                name="reason"
                                className="min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                                placeholder="Reason (optional)"
                            />
                            <Button type="submit" variant="destructive">
                Submit Deletion Request
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Export Candidate Data</CardTitle>
                        <CardDescription>Download the data currently stored for your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/api/compliance/export">Download My Data</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Deletion Request History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {requests.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No deletion requests submitted yet.</p>
                    ) : (
                        requests.map(request => (
                            <div key={request.id} className="rounded-md border p-4">
                                <p className="text-sm font-medium">{request.status}</p>
                                <p className="text-sm text-muted-foreground">
                  Requested {new Date(request.requestedAt).toLocaleString()}
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {request.reason ?? 'No reason provided'}
                                </p>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
