import { Suspense } from 'react'
import { Plus, Mail, FileText } from 'lucide-react'
import { createEmailTemplateAction, createNotificationAction } from '@/app/actions/enterprise'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminPageHeader, TableSkeleton } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function AdminTemplatesPage() {
    await requireCurrentUser({
        roles: ['ADMIN', 'EMPLOYER'],
        permission: 'MANAGE_NOTIFICATIONS',
    })

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Email Templates"
                description="Manage notification templates and send communications"
            />

            <Tabs defaultValue="templates" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="send">Send Notification</TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Suspense fallback={<Card><CardContent className="h-[400px] animate-pulse bg-muted" /></Card>}>
                            <CreateTemplateForm />
                        </Suspense>
                        <Suspense fallback={<Card><CardContent className="h-[400px] animate-pulse bg-muted" /></Card>}>
                            <TemplatesList />
                        </Suspense>
                    </div>
                </TabsContent>

                <TabsContent value="send">
                    <Suspense fallback={<Card><CardContent className="h-[400px] animate-pulse bg-muted" /></Card>}>
                        <SendNotificationForm />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    )
}

async function CreateTemplateForm() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Create Template
                </CardTitle>
                <CardDescription>
                    Use placeholders like {'{{candidateName}}'}, {'{{jobTitle}}'} in subject and body.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={createEmailTemplateAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Template Name</Label>
                        <Input id="name" name="name" placeholder="e.g., interview-invitation" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" name="subject" placeholder="e.g., Interview Invitation for {{jobTitle}}" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="body">Body</Label>
                        <Textarea
                            id="body"
                            name="body"
                            placeholder="Dear {{candidateName}},&#10;&#10;We are pleased to invite you..."
                            className="min-h-[150px]"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="jobId">Job ID (Optional)</Label>
                        <Input id="jobId" name="jobId" placeholder="Link to specific job" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="isActive" name="isActive" value="true" defaultChecked />
                        <Label htmlFor="isActive" className="text-sm font-normal">
                            Active template
                        </Label>
                    </div>
                    <Button type="submit" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Save Template
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

async function TemplatesList() {
    const templates = await prisma.emailTemplate.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 100,
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle>Saved Templates</CardTitle>
                <CardDescription>{templates.length} templates available</CardDescription>
            </CardHeader>
            <CardContent>
                {templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No templates created yet.</p>
                        <p className="text-sm text-muted-foreground">Create your first template to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {templates.map(template => (
                            <div key={template.id} className="rounded-lg border p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium">{template.name}</p>
                                    <Badge variant={template.isActive ? 'default' : 'secondary'}>
                                        {template.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{template.subject}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {template.body}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Updated {format(new Date(template.updatedAt), 'MMM d, yyyy')}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

async function SendNotificationForm() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: { id: true, email: true },
    })

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Send Notification
                </CardTitle>
                <CardDescription>Send a direct notification to a user</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={createNotificationAction} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="userId">Recipient</Label>
                            <Select name="userId" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map(user => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="channel">Channel</Label>
                            <Select name="channel" defaultValue="EMAIL">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EMAIL">Email</SelectItem>
                                    <SelectItem value="IN_APP">In-App</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" name="subject" placeholder="Notification subject" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="body">Message</Label>
                        <Textarea
                            id="body"
                            name="body"
                            placeholder="Write your message..."
                            className="min-h-[120px]"
                            required
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="applicationId">Application ID (Optional)</Label>
                            <Input id="applicationId" name="applicationId" placeholder="Link to application" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="templateId">Template ID (Optional)</Label>
                            <Input id="templateId" name="templateId" placeholder="Use template" />
                        </div>
                    </div>
                    <Button type="submit">
                        <Mail className="mr-2 h-4 w-4" />
                        Send Notification
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
