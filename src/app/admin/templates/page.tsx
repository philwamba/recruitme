import { createEmailTemplateAction, createNotificationAction } from '@/app/actions/enterprise'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function AdminTemplatesPage() {
  await requireCurrentUser({
    roles: ['ADMIN', 'EMPLOYER'],
    permission: 'MANAGE_NOTIFICATIONS',
  })

  const [templates, users] = await Promise.all([
    prisma.emailTemplate.findMany({
      include: { job: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ])

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notification Templates</h1>
        <p className="text-muted-foreground">
          Manage reusable templates and queue direct candidate notifications.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Save Template</CardTitle>
            <CardDescription>Use placeholders like {'{{jobTitle}}'} in subject and body.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createEmailTemplateAction} className="space-y-3">
              <input name="name" placeholder="template-name" className="w-full rounded-md border px-3 py-2 text-sm" />
              <input name="subject" placeholder="Subject" className="w-full rounded-md border px-3 py-2 text-sm" />
              <textarea name="body" placeholder="Template body" className="min-h-32 w-full rounded-md border px-3 py-2 text-sm" />
              <input name="jobId" placeholder="Optional job ID" className="w-full rounded-md border px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input name="isActive" type="checkbox" value="true" defaultChecked />
                Active
              </label>
              <Button type="submit">Save Template</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue Notification</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createNotificationAction} className="space-y-3">
              <select name="userId" className="w-full rounded-md border px-3 py-2 text-sm">
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </select>
              <input name="applicationId" placeholder="Optional application ID" className="w-full rounded-md border px-3 py-2 text-sm" />
              <select name="channel" defaultValue="EMAIL" className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="EMAIL">EMAIL</option>
                <option value="IN_APP">IN_APP</option>
                <option value="SMS">SMS</option>
              </select>
              <input name="subject" placeholder="Subject" className="w-full rounded-md border px-3 py-2 text-sm" />
              <textarea name="body" placeholder="Message body" className="min-h-24 w-full rounded-md border px-3 py-2 text-sm" />
              <input name="templateId" placeholder="Optional template ID" className="w-full rounded-md border px-3 py-2 text-sm" />
              <Button type="submit" variant="outline">Queue Notification</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="rounded-md border p-3">
              <p className="font-medium">{template.name}</p>
              <p className="text-sm text-muted-foreground">{template.subject}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{template.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
