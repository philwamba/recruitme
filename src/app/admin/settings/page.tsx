import { requireCurrentUser } from '@/lib/auth'
import { AdminPageHeader } from '@/components/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
    })

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Settings"
                description="Manage system configuration and platform settings"
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
                                Admin settings and system configuration will be available here
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border border-dashed p-6">
                        <h3 className="mb-2 font-medium">Planned Features</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• System configuration and platform settings</li>
                            <li>• Email template defaults and customization</li>
                            <li>• User management defaults and role permissions</li>
                            <li>• Security settings (session timeout, password policies)</li>
                            <li>• Data & compliance (retention policies, audit settings)</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
