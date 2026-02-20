'use client'

import * as React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowRight, Briefcase, MapPin, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/extended/status-badge'
import { EmptyState } from '@/components/ui/extended/empty-state'
import { ROUTES } from '@/lib/constants/routes'
import type { ApplicationWithJob } from '@/types/profile'

interface RecentApplicationsProps {
  applications: ApplicationWithJob[]
}

export function RecentApplications({ applications }: RecentApplicationsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Applications</CardTitle>
        {applications.length > 0 && (
          <Button variant="ghost" size="sm" className="gap-1" disabled>
            View all
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No applications yet"
            description="Start applying to jobs to track your progress here."
            variant="compact"
          />
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <ApplicationItem key={application.id} application={application} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ApplicationItem({ application }: { application: ApplicationWithJob }) {
  const { job, status, appliedAt } = application

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
      <div className="flex items-start gap-3">
        {/* Company icon placeholder */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="min-w-0">
          <h4 className="font-medium text-foreground truncate">{job.title}</h4>
          <p className="text-sm text-muted-foreground">{job.company}</p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.location}
              </span>
            )}
            <span>Applied {format(new Date(appliedAt), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>

      <StatusBadge status={status} />
    </div>
  )
}
