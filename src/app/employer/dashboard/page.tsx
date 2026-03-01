import { requireCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function EmployerDashboardPage() {
  const user = await requireCurrentUser({
    roles: ['EMPLOYER'],
  })

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-lg space-y-3 text-center">
        <h1 className="text-2xl font-semibold">Employer Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user.email}. The protected employer area is online and ready for Phase 2
          feature delivery.
        </p>
      </div>
    </div>
  )
}
