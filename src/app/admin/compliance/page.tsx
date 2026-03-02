import { processDeletionRequestAction } from '@/app/actions/enterprise'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function AdminCompliancePage() {
  await requireCurrentUser({
    roles: ['ADMIN'],
    permission: 'MANAGE_COMPLIANCE',
  })

  const requests = await prisma.dataDeletionRequest.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Compliance Operations</h1>
        <p className="text-muted-foreground">
          Review and process candidate data deletion requests.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Deletion Requests</CardTitle>
          <CardDescription>Approve or reject candidate removal requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deletion requests have been submitted.</p>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="rounded-md border p-4">
                <p className="font-medium">{request.user.email}</p>
                <p className="text-sm text-muted-foreground">
                  {request.status} • Requested {new Date(request.requestedAt).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{request.reason ?? 'No reason provided'}</p>
                <form action={processDeletionRequestAction} className="mt-4 space-y-3">
                  <input type="hidden" name="requestId" value={request.id} />
                  <label htmlFor={`notes-${request.id}`} className="sr-only">
                    Processing notes
                  </label>
                  <textarea
                    id={`notes-${request.id}`}
                    name="notes"
                    className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Processing notes"
                    aria-label="Processing notes"
                  />
                  <div className="flex gap-3">
                    <Button type="submit" name="action" value="approve" variant="destructive">
                      Approve
                    </Button>
                    <Button type="submit" name="action" value="reject" variant="outline">
                      Reject
                    </Button>
                  </div>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
