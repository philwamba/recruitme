import 'server-only'

import { prisma } from '@/lib/prisma'
import { removePrivateFile } from '@/lib/services/private-files'
import { reportError } from '@/lib/observability/error-reporting'

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
        select: { storageKey: true },
    })

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
                status: 'IN_PROGRESS',
                notes: notes ?? null,
            },
        }),
    ])

    const failedDeletions: string[] = []
    for (const document of documents) {
        const success = await removePrivateFile(document.storageKey)
        if (!success) {
            failedDeletions.push(document.storageKey)
            reportError(new Error('File deletion failed'), {
                scope: 'compliance.file-deletion',
                metadata: { requestId, storageKey: document.storageKey },
            })
        }
    }

    const finalStatus = failedDeletions.length > 0 ? 'FAILED' : 'COMPLETED'
    const finalNotes = failedDeletions.length > 0
        ? `${notes ?? ''}\nWarning: ${failedDeletions.length} file(s) could not be deleted from storage.`.trim()
        : notes ?? null

    return prisma.dataDeletionRequest.update({
        where: { id: requestId },
        data: {
            status: finalStatus,
            processedAt: new Date(),
            notes: finalNotes,
        },
    })
}
