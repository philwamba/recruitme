'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import { createAuditLog, createActivityLog } from '@/lib/observability/audit'
import { reportError } from '@/lib/observability/error-reporting'
import {
    applicationDraftSchema,
    applicationNoteSchema,
    applicationRatingSchema,
    applicationTagSchema,
    stageMoveSchema,
} from '@/lib/validations/application'
import { savePrivateFile } from '@/lib/services/private-files'
import { createNotification } from '@/lib/services/notifications'

function createTrackingId() {
    return `APP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
}

async function upsertApplicationRecord(params: {
  userId: string
  jobId: string
  coverLetter: string
  source?: string
  consentAccepted: boolean
  submit: boolean
}) {
    const stages = await prisma.jobPipelineStage.findMany({
        where: { jobId: params.jobId },
        orderBy: { order: 'asc' },
    })
    const defaultStage = stages[0] ?? null

    const application = await prisma.application.upsert({
        where: {
            userId_jobId: {
                userId: params.userId,
                jobId: params.jobId,
            },
        },
        update: {
            coverLetter: params.coverLetter,
            source: params.source ?? 'Website',
            consentAcceptedAt: params.consentAccepted ? new Date() : null,
            status: params.submit ? 'SUBMITTED' : 'DRAFT',
            submittedAt: params.submit ? new Date() : null,
            currentStageId: defaultStage?.id ?? null,
        },
        create: {
            trackingId: createTrackingId(),
            userId: params.userId,
            jobId: params.jobId,
            coverLetter: params.coverLetter,
            source: params.source ?? 'Website',
            consentAcceptedAt: params.consentAccepted ? new Date() : null,
            status: params.submit ? 'SUBMITTED' : 'DRAFT',
            submittedAt: params.submit ? new Date() : null,
            currentStageId: defaultStage?.id ?? null,
        },
        include: {
            currentStage: true,
        },
    })

    if (params.submit && defaultStage) {
        await prisma.applicationStageEvent.create({
            data: {
                applicationId: application.id,
                toStageId: defaultStage.id,
                changedByUserId: params.userId,
                note: 'Application submitted',
            },
        })
    }

    return application
}

async function storeUploadedFiles({
    applicationId,
    applicantProfileId,
    userId,
    cvFile,
    supportingDocuments,
}: {
  applicationId: string
  applicantProfileId: string | null
  userId: string
  cvFile: File | null
  supportingDocuments: File[]
}) {
    if (cvFile && cvFile.size > 0) {
        const stored = await savePrivateFile(cvFile)

        await prisma.candidateDocument.create({
            data: {
                applicationId,
                applicantProfileId,
                uploadedByUserId: userId,
                documentType: 'CV',
                storageKey: stored.storageKey,
                originalFileName: stored.originalFileName,
                mimeType: stored.mimeType,
                sizeBytes: stored.sizeBytes,
                sha256: stored.sha256,
                scanStatus: 'CLEAN',
            },
        })

        if (applicantProfileId) {
            await prisma.applicantProfile.update({
                where: { id: applicantProfileId },
                data: {
                    cvUrl: stored.storageKey,
                    cvFileName: stored.originalFileName,
                    cvParsedAt: new Date(),
                },
            })
        }
    }

    for (const document of supportingDocuments) {
        if (!document || document.size === 0) continue

        const stored = await savePrivateFile(document)
        await prisma.candidateDocument.create({
            data: {
                applicationId,
                applicantProfileId,
                uploadedByUserId: userId,
                documentType: 'SUPPORTING_DOCUMENT',
                storageKey: stored.storageKey,
                originalFileName: stored.originalFileName,
                mimeType: stored.mimeType,
                sizeBytes: stored.sizeBytes,
                sha256: stored.sha256,
                scanStatus: 'CLEAN',
            },
        })
    }
}

export async function saveApplicationDraft(jobId: string, formData: FormData) {
    const user = await requireCurrentUser({
        roles: ['APPLICANT'],
        permission: 'MANAGE_SELF_PROFILE',
    })

    const parsed = applicationDraftSchema.safeParse({
        coverLetter: formData.get('coverLetter') || '',
        source: formData.get('source') || 'Website',
        consentAccepted: formData.get('consentAccepted') === 'true',
    })

    if (!parsed.success) {
        redirect('/applicant/applications?error=invalid-draft')
    }

    try {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId: user.id },
        })

        const application = await upsertApplicationRecord({
            userId: user.id,
            jobId,
            coverLetter: parsed.data.coverLetter,
            source: parsed.data.source,
            consentAccepted: parsed.data.consentAccepted,
            submit: false,
        })

        const cvFile = formData.get('cvFile')
        const supportingDocuments = formData
            .getAll('supportingDocuments')
            .filter((value): value is File => value instanceof File)

        await storeUploadedFiles({
            applicationId: application.id,
            applicantProfileId: profile?.id ?? null,
            userId: user.id,
            cvFile: cvFile instanceof File ? cvFile : null,
            supportingDocuments,
        })

        await createActivityLog({
            actorUserId: user.id,
            description: 'Saved application draft',
            metadata: { jobId, applicationId: application.id },
        })

        revalidatePath('/applicant/applications')
        revalidatePath('/jobs')

        // Best-effort notification - don't fail the action if notification fails
        try {
            await createNotification({
                userId: user.id,
                channel: 'IN_APP',
                applicationId: application.id,
                subject: `Draft saved for ${jobId}`,
                body: `Your application draft ${application.trackingId} has been saved.`,
            })
        } catch (notificationError) {
            reportError(notificationError, {
                scope: 'applications.save-draft.notification',
                userId: user.id,
                metadata: { jobId, applicationId: application.id },
            })
        }
    } catch (error) {
        reportError(error, {
            scope: 'applications.save-draft',
            userId: user.id,
            metadata: { jobId },
        })
        redirect('/applicant/applications?error=save-draft')
    }

    redirect('/applicant/applications?status=draft-saved')
}

export async function submitApplication(jobId: string, formData: FormData) {
    const user = await requireCurrentUser({
        roles: ['APPLICANT'],
        permission: 'MANAGE_SELF_PROFILE',
    })

    const parsed = applicationDraftSchema.safeParse({
        coverLetter: formData.get('coverLetter') || '',
        source: formData.get('source') || 'Website',
        consentAccepted: formData.get('consentAccepted') === 'true',
    })

    if (!parsed.success || !parsed.data.consentAccepted) {
        redirect('/applicant/applications?error=invalid-submission')
    }

    try {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId: user.id },
        })

        const application = await upsertApplicationRecord({
            userId: user.id,
            jobId,
            coverLetter: parsed.data.coverLetter,
            source: parsed.data.source,
            consentAccepted: parsed.data.consentAccepted,
            submit: true,
        })

        const cvFile = formData.get('cvFile')
        const supportingDocuments = formData
            .getAll('supportingDocuments')
            .filter((value): value is File => value instanceof File)

        await storeUploadedFiles({
            applicationId: application.id,
            applicantProfileId: profile?.id ?? null,
            userId: user.id,
            cvFile: cvFile instanceof File ? cvFile : null,
            supportingDocuments,
        })

        await createAuditLog({
            actorUserId: user.id,
            action: 'application.submitted',
            targetType: 'Application',
            targetId: application.id,
            metadata: {
                trackingId: application.trackingId,
            },
        })

        await prisma.consentRecord.create({
            data: {
                userId: user.id,
                applicationId: application.id,
                consentType: 'APPLICATION_PROCESSING',
            },
        })

        // Best-effort notification - don't fail the action if notification fails
        try {
            await createNotification({
                userId: user.id,
                channel: 'IN_APP',
                applicationId: application.id,
                subject: `Application submitted: ${application.trackingId}`,
                body: 'Your application has been submitted successfully.',
            })
        } catch (notificationError) {
            reportError(notificationError, {
                scope: 'applications.submit.notification',
                userId: user.id,
                metadata: { jobId, applicationId: application.id },
            })
        }

        revalidatePath('/applicant/applications')
        revalidatePath('/jobs')
        redirect(`/applicant/applications?status=submitted&trackingId=${application.trackingId}`)
    } catch (error) {
    // Re-throw Next.js redirect errors (they use NEXT_REDIRECT digest)
        if (error instanceof Error && 'digest' in error && String((error as { digest?: string }).digest).startsWith('NEXT_REDIRECT')) {
            throw error
        }

        reportError(error, {
            scope: 'applications.submit',
            userId: user.id,
            metadata: { jobId },
        })
        redirect('/applicant/applications?error=submit-application')
    }
}

export async function moveApplicationStage(formData: FormData) {
    const user = await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    const parsed = stageMoveSchema.safeParse({
        applicationId: formData.get('applicationId'),
        stageId: formData.get('stageId'),
        note: formData.get('note') || '',
    })

    if (!parsed.success) {
        return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid stage update' }
    }

    try {
        const [application, stage] = await Promise.all([
            prisma.application.findUnique({
                where: { id: parsed.data.applicationId },
            }),
            prisma.jobPipelineStage.findUnique({
                where: { id: parsed.data.stageId },
            }),
        ])

        if (!application || !stage || application.jobId !== stage.jobId) {
            return { success: false, error: 'Application or stage not found' }
        }

        const previousStageId = application.currentStageId
        const status = mapStageNameToStatus(stage.name)

        await prisma.$transaction([
            prisma.application.update({
                where: { id: application.id },
                data: {
                    currentStageId: stage.id,
                    status,
                },
            }),
            prisma.applicationStageEvent.create({
                data: {
                    applicationId: application.id,
                    fromStageId: previousStageId,
                    toStageId: stage.id,
                    changedByUserId: user.id,
                    note: parsed.data.note,
                },
            }),
        ])

        const updatedApplication = await prisma.application.findUnique({
            where: { id: application.id },
            include: {
                user: true,
            },
        })

        // Best-effort notification - don't fail the action if notification fails
        if (updatedApplication) {
            try {
                await createNotification({
                    userId: updatedApplication.userId,
                    channel: 'EMAIL',
                    applicationId: updatedApplication.id,
                    subject: `Application status updated to ${stage.name}`,
                    body: `Your application ${updatedApplication.trackingId} moved to ${stage.name}.`,
                })
            } catch (notificationError) {
                reportError(notificationError, {
                    scope: 'applications.move-stage.notification',
                    userId: user.id,
                    metadata: { applicationId: updatedApplication.id },
                })
            }
        }

        revalidatePath('/employer/candidates')

        return { success: true }
    } catch (error) {
        reportError(error, {
            scope: 'applications.move-stage',
            userId: user.id,
        })
        return { success: false, error: 'Failed to move application stage' }
    }
}

export async function addApplicationNote(formData: FormData) {
    const user = await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    const parsed = applicationNoteSchema.safeParse({
        applicationId: formData.get('applicationId'),
        body: formData.get('body'),
    })

    if (!parsed.success) {
        return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid note' }
    }

    await prisma.applicationNote.create({
        data: {
            applicationId: parsed.data.applicationId,
            authorUserId: user.id,
            body: parsed.data.body,
        },
    })

    revalidatePath('/employer/candidates')
    return { success: true }
}

export async function addApplicationTag(formData: FormData) {
    const user = await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })
    void user

    const parsed = applicationTagSchema.safeParse({
        applicationId: formData.get('applicationId'),
        tagName: formData.get('tagName'),
        tagColor: formData.get('tagColor') || '',
    })

    if (!parsed.success) {
        return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid tag' }
    }

    const tag = await prisma.tag.upsert({
        where: { name: parsed.data.tagName },
        update: {
            color: parsed.data.tagColor || null,
        },
        create: {
            name: parsed.data.tagName,
            color: parsed.data.tagColor || null,
        },
    })

    await prisma.applicationTag.upsert({
        where: {
            applicationId_tagId: {
                applicationId: parsed.data.applicationId,
                tagId: tag.id,
            },
        },
        update: {},
        create: {
            applicationId: parsed.data.applicationId,
            tagId: tag.id,
        },
    })

    revalidatePath('/employer/candidates')
    return { success: true }
}

export async function addApplicationRating(formData: FormData) {
    const user = await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    const parsed = applicationRatingSchema.safeParse({
        applicationId: formData.get('applicationId'),
        score: formData.get('score'),
        comment: formData.get('comment') || '',
    })

    if (!parsed.success) {
        return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid rating' }
    }

    await prisma.applicationRating.create({
        data: {
            applicationId: parsed.data.applicationId,
            authorUserId: user.id,
            score: parsed.data.score,
            comment: parsed.data.comment || null,
        },
    })

    revalidatePath('/employer/candidates')
    return { success: true }
}

function mapStageNameToStatus(stageName: string) {
    const normalized = stageName.toLowerCase()

    if (normalized.includes('review')) return 'UNDER_REVIEW'
    if (normalized.includes('shortlist')) return 'SHORTLISTED'
    if (normalized.includes('phase 1')) return 'INTERVIEW_PHASE_1'
    if (normalized.includes('phase 2')) return 'INTERVIEW_PHASE_2'
    if (normalized.includes('assessment')) return 'ASSESSMENT'
    if (normalized.includes('offer')) return 'OFFER'
    if (normalized.includes('reject')) return 'REJECTED'
    if (normalized.includes('hired')) return 'HIRED'

    return 'SUBMITTED'
}
