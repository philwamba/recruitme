import 'server-only'

import { prisma } from '@/lib/prisma'

const DEFAULT_STAGE_NAMES = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview Phase 1',
  'Interview Phase 2',
  'Assessment',
  'Offer',
  'Hired',
  'Rejected',
]

export async function createDefaultPipelineStages(jobId: string) {
  await prisma.jobPipelineStage.createMany({
    data: DEFAULT_STAGE_NAMES.map((name, index) => ({
      jobId,
      name,
      order: index + 1,
      isDefault: index === 0,
    })),
  })

  return prisma.jobPipelineStage.findMany({
    where: { jobId },
    orderBy: { order: 'asc' },
  })
}
