import { getOrCreateProfile } from '@/app/actions/profile'
import { PersonalInfoSection } from '@/components/applicant/profile/personal-info-section'
import { LinksSection } from '@/components/applicant/profile/links-section'
import { SummarySection } from '@/components/applicant/profile/summary-section'
import { SkillsSection } from '@/components/applicant/profile/skills-section'
import { ExperienceSection } from '@/components/applicant/profile/experience-section'
import { EducationSection } from '@/components/applicant/profile/education-section'
import { CertificationsSection } from '@/components/applicant/profile/certifications-section'
import { ProgressRing } from '@/components/ui/extended/progress-ring'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'My Profile | RecruitMe',
  description: 'Manage your applicant profile',
}

export default async function ProfilePage() {
  const profile = await getOrCreateProfile()

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Failed to load profile. Please try again.</p>
      </div>
    )
  }

  const totalYearsDisplay = profile.totalYearsExperience
    ? `${profile.totalYearsExperience} year${profile.totalYearsExperience !== 1 ? 's' : ''} of experience`
    : null

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile information and make it stand out to employers.
          </p>
        </div>

        {/* Profile completion mini-widget */}
        <Card className="sm:w-auto">
          <CardContent className="flex items-center gap-4 p-4">
            <ProgressRing value={profile.profileCompleteness} size="sm" />
            <div>
              <p className="text-sm font-medium">Profile Strength</p>
              {totalYearsDisplay && (
                <p className="text-xs text-muted-foreground">{totalYearsDisplay}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Sections */}
      <div className="space-y-6">
        <PersonalInfoSection profile={profile} />
        <LinksSection profile={profile} />
        <SummarySection profile={profile} />
        <SkillsSection profile={profile} />
        <ExperienceSection experiences={profile.workExperiences} />
        <EducationSection educations={profile.educations} />
        <CertificationsSection certifications={profile.certifications} />
      </div>
    </div>
  )
}
