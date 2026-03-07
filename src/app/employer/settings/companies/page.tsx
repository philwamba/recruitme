import { Building2 } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EmployerPageHeader } from '@/components/employer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function EmployerCompaniesPage() {
    const user = await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    // Get distinct companies with job counts
    const jobs = await prisma.job.findMany({
        where: { createdByUserId: user.id },
        select: { company: true },
    })

    // Count jobs per company
    const companyCounts = jobs.reduce<Record<string, number>>((acc, job) => {
        if (job.company) {
            acc[job.company] = (acc[job.company] || 0) + 1
        }
        return acc
    }, {})

    const companies = Object.entries(companyCounts)
        .map(([name, count]) => ({ name, jobCount: count }))
        .sort((a, b) => a.name.localeCompare(b.name))

    return (
        <div className="space-y-6">
            <EmployerPageHeader
                title="Companies"
                description="View companies used in your job postings"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Your Companies
                    </CardTitle>
                    <CardDescription>
                        Companies are automatically saved when you create jobs. They will appear as suggestions in the job creation form.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {companies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Building2 className="h-12 w-12 text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">No companies yet.</p>
                            <p className="text-sm text-muted-foreground">Create a job to add your first company.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {companies.map(company => (
                                <div
                                    key={company.name}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                                            <Building2 className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium">{company.name}</span>
                                    </div>
                                    <Badge variant="secondary">
                                        {company.jobCount} {company.jobCount === 1 ? 'job' : 'jobs'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
