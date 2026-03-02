import 'server-only'

import { prisma } from '@/lib/prisma'

export async function getRecruitmentAnalytics() {
  const [
    jobs,
    applicationsPerJob,
    hiredApplications,
    totalApplications,
    stageEvents,
  ] = await Promise.all([
    prisma.job.count(),
    prisma.job.findMany({
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: {
        applications: { _count: 'desc' },
      },
      take: 10,
    }),
    prisma.application.findMany({
      where: { status: 'HIRED', submittedAt: { not: null } },
      select: { submittedAt: true, updatedAt: true },
    }),
    prisma.application.count({
      where: { status: { not: 'DRAFT' } },
    }),
    prisma.applicationStageEvent.findMany({
      include: { toStage: true },
    }),
  ])

  const avgTimeToHireDays =
    hiredApplications.length === 0
      ? 0
      : hiredApplications.reduce((total, app) => {
          const start = app.submittedAt ?? app.updatedAt
          const end = app.updatedAt
          return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        }, 0) / hiredApplications.length

  const conversionByStage = stageEvents.reduce<Record<string, number>>((acc, event) => {
    const key = event.toStage?.name ?? 'Unassigned'
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  return {
    jobs,
    totalApplications,
    avgTimeToHireDays: Number(avgTimeToHireDays.toFixed(1)),
    applicationsPerJob: applicationsPerJob.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      count: job._count.applications,
    })),
    conversionByStage,
  }
}
