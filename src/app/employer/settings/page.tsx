import { requireCurrentUser } from '@/lib/auth'
import { EmployerPageHeader } from '@/components/employer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EmployerSettingsPage() {
    await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    return (
        <div className="space-y-6">
            <EmployerPageHeader
                title="Settings"
                description="Manage your account and recruitment preferences"
            />

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Settings className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Settings Coming Soon</CardTitle>
                            <CardDescription>
                                Employer settings and preferences will be available here
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border border-dashed p-6">
                        <h3 className="mb-2 font-medium">Planned Features</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Account information management</li>
                            <li>• Notification preferences (email frequency, types)</li>
                            <li>• Company information and branding</li>
                            <li>• Interview default settings (duration, timezone)</li>
                            <li>• Privacy controls and data export</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
