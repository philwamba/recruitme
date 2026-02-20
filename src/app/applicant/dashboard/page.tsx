import { Suspense } from 'react'
import { getDashboardStats, getOrCreateProfile } from '@/app/actions/profile'
import { ProfileCompletionCard } from '@/components/applicant/dashboard/profile-completion-card'
import { StatsGrid } from '@/components/applicant/dashboard/stats-grid'
import { RecentApplications } from '@/components/applicant/dashboard/recent-applications'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Dashboard | RecruitMe',
  description: 'Your applicant dashboard',
}

export default async function DashboardPage() {
  const [profile, dashboardData] = await Promise.all([
    getOrCreateProfile(),
    getDashboardStats(),
  ])

  const stats = dashboardData?.stats ?? {
    totalApplications: 0,
    pendingApplications: 0,
    reviewingApplications: 0,
    shortlistedApplications: 0,
    rejectedApplications: 0,
    hiredApplications: 0,
  }

  const recentApplications = dashboardData?.recentApplications ?? []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{profile?.firstName ? `, ${profile.firstName}` : ''}! Here&apos;s an overview of your profile and applications.
        </p>
      </div>

      {/* Profile Completion Card */}
      <ProfileCompletionCard profile={profile} />

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Recent Applications */}
      <RecentApplications applications={recentApplications} />
    </div>
  )
}
