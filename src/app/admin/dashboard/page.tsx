import Link from 'next/link'
import { requireCurrentUser } from '@/lib/auth'
import { ROUTES } from '@/lib/constants/routes'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const user = await requireCurrentUser({
    roles: ['ADMIN'],
  })

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user.email}. Review core operational, analytics, compliance, and access
          management areas.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href={ROUTES.ADMIN.USERS}>Users</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.ADMIN.ANALYTICS}>Analytics</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.ADMIN.TEMPLATES}>Templates</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.ADMIN.COMPLIANCE}>Compliance</Link>
        </Button>
        <Button asChild>
          <Link href={ROUTES.ADMIN.OPERATIONS}>Operations</Link>
        </Button>
      </div>
    </div>
  )
}
