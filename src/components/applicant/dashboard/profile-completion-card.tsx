'use client'

import * as React from 'react'
import Link from 'next/link'
import { FileText, User, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressRing } from '@/components/ui/extended/progress-ring'
import { ROUTES } from '@/lib/constants/routes'
import type { ApplicantProfileWithRelations } from '@/types/profile'

interface ProfileCompletionCardProps {
  profile: ApplicantProfileWithRelations | null
}

export function ProfileCompletionCard({ profile }: ProfileCompletionCardProps) {
  const completeness = profile?.profileCompleteness ?? 0
  const hasCV = !!profile?.cvUrl

  // Determine primary CTA
  const primaryCTA = !hasCV
    ? {
        label: 'Upload CV',
        href: ROUTES.APPLICANT.UPLOAD_CV,
        icon: FileText,
        description: 'Upload your CV to auto-fill your profile',
      }
    : {
        label: 'Complete Profile',
        href: ROUTES.APPLICANT.PROFILE,
        icon: User,
        description: 'Add more details to stand out',
      }

  return (
    <Card className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

      <CardHeader className="relative pb-2">
        <CardTitle className="text-lg font-semibold">Profile Strength</CardTitle>
      </CardHeader>

      <CardContent className="relative">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Progress Ring */}
          <ProgressRing value={completeness} size="lg" />

          {/* CTA Section */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-medium text-foreground">{primaryCTA.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {primaryCTA.description}
            </p>

            <Button asChild className="mt-4 gap-2">
              <Link href={primaryCTA.href}>
                <primaryCTA.icon className="h-4 w-4" />
                {primaryCTA.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Completion tips */}
        {completeness < 100 && (
          <div className="mt-6 rounded-lg border bg-muted/50 p-4">
            <p className="text-sm font-medium text-foreground">
              Tips to improve your profile:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {!profile?.headline && (
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Add a professional headline
                </li>
              )}
              {!profile?.bio && (
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Write a summary about yourself
                </li>
              )}
              {(profile?.skills?.length ?? 0) < 3 && (
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Add at least 3 skills
                </li>
              )}
              {(profile?.workExperiences?.length ?? 0) === 0 && (
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Add your work experience
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
