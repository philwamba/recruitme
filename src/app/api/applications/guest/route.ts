import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { savePrivateFile, removePrivateFile } from '@/lib/services/private-files'
import { createAuditLog } from '@/lib/observability/audit'
import { reportError } from '@/lib/observability/error-reporting'

const guestApplicationSchema = z.object({
    jobId: z.string().min(1, 'Job ID is required'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    coverLetter: z.string().optional(),
    consentAccepted: z.enum(['true', 'false']).transform(v => v === 'true'),
})

function createTrackingId() {
    return `APP-${randomBytes(8).toString('hex').toUpperCase()}`
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()

        const parseResult = guestApplicationSchema.safeParse({
            jobId: formData.get('jobId'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone') || '',
            coverLetter: formData.get('coverLetter') || '',
            consentAccepted: formData.get('consentAccepted'),
        })

        if (!parseResult.success) {
            return NextResponse.json(
                { message: parseResult.error.errors[0]?.message || 'Invalid form data' },
                { status: 400 },
            )
        }

        const data = parseResult.data

        if (!data.consentAccepted) {
            return NextResponse.json(
                { message: 'You must accept the data processing consent' },
                { status: 400 },
            )
        }

        const job = await prisma.job.findUnique({
            where: { id: data.jobId },
            select: { id: true, status: true, title: true },
        })

        if (!job || job.status !== 'PUBLISHED') {
            return NextResponse.json(
                { message: 'This job is no longer accepting applications' },
                { status: 400 },
            )
        }

        const cvFile = formData.get('cvFile')
        if (!(cvFile instanceof File) || cvFile.size === 0) {
            return NextResponse.json(
                { message: 'CV is required to submit your application' },
                { status: 400 },
            )
        }

        let user = await prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
            include: { applicantProfile: true },
        })

        if (user && user.role !== 'APPLICANT') {
            return NextResponse.json(
                { message: 'This email is associated with a non-applicant account. Please use a different email or sign in.' },
                { status: 400 },
            )
        }

        if (user) {
            const existingApplication = await prisma.application.findUnique({
                where: {
                    userId_jobId: {
                        userId: user.id,
                        jobId: data.jobId,
                    },
                },
            })

            if (existingApplication) {
                return NextResponse.json(
                    { message: 'You have already applied for this position. Sign in to view your application.' },
                    { status: 400 },
                )
            }
        }

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: data.email.toLowerCase(),
                    role: 'APPLICANT',
                    applicantProfile: {
                        create: {
                            firstName: data.firstName,
                            lastName: data.lastName,
                            phone: data.phone || null,
                        },
                    },
                },
                include: { applicantProfile: true },
            })
        } else if (user.applicantProfile) {
            if (!user.applicantProfile.firstName || !user.applicantProfile.lastName) {
                await prisma.applicantProfile.update({
                    where: { id: user.applicantProfile.id },
                    data: {
                        firstName: user.applicantProfile.firstName || data.firstName,
                        lastName: user.applicantProfile.lastName || data.lastName,
                        phone: user.applicantProfile.phone || data.phone || null,
                    },
                })
            }
        } else {
            const profile = await prisma.applicantProfile.create({
                data: {
                    userId: user.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone || null,
                },
            })
            user = { ...user, applicantProfile: profile }
        }

        const stages = await prisma.jobPipelineStage.findMany({
            where: { jobId: data.jobId },
            orderBy: { order: 'asc' },
        })
        const defaultStage = stages[0] ?? null

        const trackingId = createTrackingId()

        const storedCv = await savePrivateFile(cvFile, { scan: true })
        let application: { id: string; trackingId: string }
        try {
            application = await prisma.$transaction(async tx => {
                const app = await tx.application.create({
                    data: {
                        trackingId,
                        userId: user.id,
                        jobId: data.jobId,
                        coverLetter: data.coverLetter || null,
                        source: 'Guest Application',
                        consentAcceptedAt: new Date(),
                        status: 'SUBMITTED',
                        submittedAt: new Date(),
                        currentStageId: defaultStage?.id ?? null,
                    },
                })

                if (defaultStage) {
                    await tx.applicationStageEvent.create({
                        data: {
                            applicationId: app.id,
                            toStageId: defaultStage.id,
                            note: 'Guest application submitted',
                        },
                    })
                }

                await tx.candidateDocument.create({
                    data: {
                        applicationId: app.id,
                        applicantProfileId: user.applicantProfile?.id ?? null,
                        uploadedByUserId: user.id,
                        documentType: 'CV',
                        storageKey: storedCv.storageKey,
                        originalFileName: storedCv.originalFileName,
                        mimeType: storedCv.mimeType,
                        sizeBytes: storedCv.sizeBytes,
                        sha256: storedCv.sha256,
                        scanStatus: storedCv.scanStatus,
                    },
                })

                if (user.applicantProfile) {
                    await tx.applicantProfile.update({
                        where: { id: user.applicantProfile.id },
                        data: {
                            cvUrl: storedCv.storageKey,
                            cvFileName: storedCv.originalFileName,
                        },
                    })
                }

                return app
            })
        } catch (txError) {
            const deleted = await removePrivateFile(storedCv.storageKey)
            if (!deleted) {
                reportError(new Error('Failed to clean up orphaned CV file'), {
                    scope: 'api.applications.guest.cleanup',
                    metadata: { storageKey: storedCv.storageKey },
                })
            }
            throw txError
        }

        const supportingDocKeys = Array.from(formData.keys()).filter(k => k.startsWith('supportingDocument_'))
        for (const key of supportingDocKeys) {
            const doc = formData.get(key)
            if (doc instanceof File && doc.size > 0) {
                const storedDoc = await savePrivateFile(doc, { scan: true })
                await prisma.candidateDocument.create({
                    data: {
                        applicationId: application.id,
                        applicantProfileId: user.applicantProfile?.id ?? null,
                        uploadedByUserId: user.id,
                        documentType: 'SUPPORTING_DOCUMENT',
                        storageKey: storedDoc.storageKey,
                        originalFileName: storedDoc.originalFileName,
                        mimeType: storedDoc.mimeType,
                        sizeBytes: storedDoc.sizeBytes,
                        sha256: storedDoc.sha256,
                        scanStatus: storedDoc.scanStatus,
                    },
                })
            }
        }

        await prisma.consentRecord.create({
            data: {
                userId: user.id,
                applicationId: application.id,
                consentType: 'APPLICATION_PROCESSING',
                ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
                userAgent: request.headers.get('user-agent') || null,
            },
        })

        await createAuditLog({
            actorUserId: user.id,
            action: 'guest_application.submitted',
            targetType: 'Application',
            targetId: application.id,
            metadata: {
                trackingId,
                jobId: data.jobId,
            },
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
            userAgent: request.headers.get('user-agent') || undefined,
        })

        return NextResponse.json({
            success: true,
            trackingId,
            message: 'Application submitted successfully',
        })
    } catch (error) {
        reportError(error, {
            scope: 'api.applications.guest',
        })

        if (error instanceof Error && error.message.includes('File')) {
            return NextResponse.json(
                { message: error.message },
                { status: 400 },
            )
        }

        return NextResponse.json(
            { message: 'An error occurred while submitting your application. Please try again.' },
            { status: 500 },
        )
    }
}
