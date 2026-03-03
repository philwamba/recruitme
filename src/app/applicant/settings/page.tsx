import { requireCurrentUser } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ApplicantSettingsPage() {
    await requireCurrentUser({
        roles: ['APPLICANT'],
        permission: 'VIEW_APPLICANT_DASHBOARD',
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account preferences and privacy controls
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Settings className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Settings Coming Soon</CardTitle>
                            <CardDescription>
                                Applicant settings and preferences will be available here
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border border-dashed p-6">
                        <h3 className="mb-2 font-medium">Planned Features</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Profile visibility (public/private)</li>
                            <li>• Notification preferences (application updates, interview reminders)</li>
                            <li>• Email preferences (newsletter, job alerts)</li>
                            <li>• Privacy controls (data download, account deletion)</li>
                            <li>• Connected accounts (LinkedIn, GitHub integrations)</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
