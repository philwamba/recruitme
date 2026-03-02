import 'server-only'

import { prisma } from '@/lib/prisma'

export async function getPipelineData(jobId: string) {
    const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: {
            id: true,
            title: true,
            company: true,
            status: true,
            pipelineStages: {
                orderBy: { order: 'asc' },
                select: {
                    id: true,
                    name: true,
                    order: true,
                    isDefault: true,
                },
            },
        },
    })

    if (!job) {
        return null
    }

    // Get all applications for this job grouped by stage
    const applications = await prisma.application.findMany({
        where: {
            jobId,
            status: { not: 'DRAFT' },
        },
        orderBy: { submittedAt: 'desc' },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    applicantProfile: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatarUrl: true,
                            headline: true,
                        },
                    },
                },
            },
            currentStage: {
                select: {
                    id: true,
                    name: true,
                },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
            ratings: {
                select: {
                    score: true,
                },
            },
            _count: {
                select: {
                    notes: true,
                    interviews: true,
                },
            },
        },
    })

    // Group applications by stage
    const applicationsByStage = new Map<string | null, typeof applications>()

    // Initialize all stages with empty arrays
    for (const stage of job.pipelineStages) {
        applicationsByStage.set(stage.id, [])
    }
    // For applications without a stage
    applicationsByStage.set(null, [])

    // Group applications
    for (const app of applications) {
        const stageId = app.currentStageId
        const existing = applicationsByStage.get(stageId) || []
        existing.push(app)
        applicationsByStage.set(stageId, existing)
    }

    // Calculate average ratings
    const stagesWithApplications = job.pipelineStages.map((stage) => {
        const stageApps = applicationsByStage.get(stage.id) || []
        return {
            ...stage,
            applications: stageApps.map((app) => ({
                ...app,
                avgRating:
                    app.ratings.length > 0
                        ? app.ratings.reduce((sum, r) => sum + r.score, 0) / app.ratings.length
                        : null,
            })),
        }
    })

    return {
        job,
        stages: stagesWithApplications,
        unassigned: applicationsByStage.get(null) || [],
    }
}

export async function getJobsForPipelineSelect() {
    return prisma.job.findMany({
        where: {
            status: { in: ['PUBLISHED', 'CLOSED'] },
        },
        orderBy: { title: 'asc' },
        select: {
            id: true,
            title: true,
            company: true,
            _count: {
                select: {
                    applications: {
                        where: { status: { not: 'DRAFT' } },
                    },
                },
            },
        },
    })
}
