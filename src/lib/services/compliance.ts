import 'server-only'

import { prisma } from '@/lib/prisma'
import { removePrivateFile } from '@/lib/services/private-files'

export async function exportCandidateData(userId: string) {
  const [user, profile, applications, documents, notifications, deletionRequests] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.applicantProfile.findUnique({ where: { userId } }),
      prisma.application.findMany({
        where: { userId },
        include: {
          job: true,
          notes: true,
          ratings: true,
          tags: { include: { tag: true } },
          stageEvents: true,
        },
      }),
      prisma.candidateDocument.findMany({
        where: {
          OR: [{ uploadedByUserId: userId }, { applicantProfile: { userId } }],
        },
      }),
      prisma.notification.findMany({ where: { userId } }),
      prisma.dataDeletionRequest.findMany({ where: { userId } }),
    ])

  return {
    exportedAt: new Date().toISOString(),
    user,
    profile,
    applications,
    documents,
    notifications,
    deletionRequests,
  }
}

export async function processDeletionRequest(requestId: string, approve: boolean, notes?: string) {
  const request = await prisma.dataDeletionRequest.findUnique({
    where: { id: requestId },
  })

  if (!request) {
    throw new Error('Deletion request not found')
  }

  if (!approve) {
    return prisma.dataDeletionRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        processedAt: new Date(),
        notes: notes ?? null,
      },
    })
  }

  const documents = await prisma.candidateDocument.findMany({
    where: {
      OR: [
        { uploadedByUserId: request.userId },
        { applicantProfile: { userId: request.userId } },
      ],
    },
  })

  for (const document of documents) {
    await removePrivateFile(document.storageKey)
  }

  await prisma.$transaction([
    prisma.notification.deleteMany({ where: { userId: request.userId } }),
    prisma.candidateDocument.deleteMany({
      where: {
        OR: [
          { uploadedByUserId: request.userId },
          { applicantProfile: { userId: request.userId } },
        ],
      },
    }),
    prisma.application.deleteMany({ where: { userId: request.userId } }),
    prisma.applicantProfile.deleteMany({ where: { userId: request.userId } }),
    prisma.dataDeletionRequest.update({
      where: { id: requestId },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        notes: notes ?? null,
      },
    }),
  ])

  return request
}
