import { Settings, User, Bell, Shield } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { EmployerPageHeader } from '@/components/employer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Account Settings</CardTitle>
                                <CardDescription>
                                    Manage your profile and account information
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Account management features coming soon.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Bell className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>
                                    Configure how you receive notifications
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Notification settings coming soon.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Settings className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Interview Defaults</CardTitle>
                                <CardDescription>
                                    Set default interview settings
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Default duration, timezone, and template settings coming soon.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Privacy & Security</CardTitle>
                                <CardDescription>
                                    Manage privacy and security settings
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Privacy controls and data export coming soon.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
