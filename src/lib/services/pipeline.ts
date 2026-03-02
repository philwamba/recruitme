import 'server-only'

import type { PrismaClient } from '@prisma/client'
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

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export async function createDefaultPipelineStages(
  jobId: string,
  tx?: TransactionClient
) {
  const client = tx ?? prisma

  // Make idempotent: check for existing stages
  const existingStages = await client.jobPipelineStage.findMany({
    where: { jobId },
    select: { name: true },
  })

  const existingNames = new Set(existingStages.map((s) => s.name))
  const missingStages = DEFAULT_STAGE_NAMES.filter((name) => !existingNames.has(name))

  if (missingStages.length === 0) {
    return client.jobPipelineStage.findMany({
      where: { jobId },
      orderBy: { order: 'asc' },
    })
  }

  // Only create missing stages
  const hasDefault = existingStages.length > 0
  await client.jobPipelineStage.createMany({
    data: missingStages.map((name, index) => ({
      jobId,
      name,
      order: existingStages.length + index + 1,
      isDefault: !hasDefault && index === 0,
    })),
  })

  return client.jobPipelineStage.findMany({
    where: { jobId },
    orderBy: { order: 'asc' },
  })
}
