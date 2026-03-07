import { MapPin } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EmployerPageHeader } from '@/components/employer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function EmployerLocationsPage() {
    const user = await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    // Get distinct locations with job counts
    const jobs = await prisma.job.findMany({
        where: { createdByUserId: user.id },
        select: { location: true },
    })

    // Count jobs per location
    const locationCounts = jobs.reduce<Record<string, number>>((acc, job) => {
        if (job.location) {
            acc[job.location] = (acc[job.location] || 0) + 1
        }
        return acc
    }, {})

    const locations = Object.entries(locationCounts)
        .map(([name, count]) => ({ name, jobCount: count }))
        .sort((a, b) => a.name.localeCompare(b.name))

    return (
        <div className="space-y-6">
            <EmployerPageHeader
                title="Locations"
                description="View locations used in your job postings"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Your Locations
                    </CardTitle>
                    <CardDescription>
                        Locations are automatically saved when you create jobs. They will appear as suggestions in the job creation form.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {locations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <MapPin className="h-12 w-12 text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">No locations yet.</p>
                            <p className="text-sm text-muted-foreground">Create a job to add your first location.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {locations.map(location => (
                                <div
                                    key={location.name}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                                            <MapPin className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium">{location.name}</span>
                                    </div>
                                    <Badge variant="secondary">
                                        {location.jobCount} {location.jobCount === 1 ? 'job' : 'jobs'}
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
