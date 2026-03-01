import { requireCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const user = await requireCurrentUser({
    roles: ['ADMIN'],
  })

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-lg space-y-3 text-center">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user.email}. The protected admin area is online and ready for Phase 2
          feature delivery.
        </p>
      </div>
    </div>
  )
}
