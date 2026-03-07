'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import {
    personalInfoSchema,
    linksSchema,
    summarySchema,
} from '@/lib/validations/profile'
import {
    calculateProfileCompletion,
} from '@/lib/services/profile-completion'
import { createActivityLog, createAuditLog } from '@/lib/observability/audit'
import { reportError } from '@/lib/observability/error-reporting'
import type { ApplicantProfileWithRelations } from '@/types/profile'
import { removePrivateFile, savePrivateFile, validatePrivateUpload } from '@/lib/services/private-files'

/**
 * Get or create the applicant profile for the current user
 */
export async function getOrCreateProfile(): Promise<ApplicantProfileWithRelations | null> {
    const user = await requireCurrentUser({
        roles: ['APPLICANT'],
        permission: 'MANAGE_SELF_PROFILE',
    })
    const userId = user.id

    try {
        let profile = await prisma.applicantProfile.findUnique({
            where: { userId },
            include: {
                workExperiences: { orderBy: { startDate: 'desc' } },
                educations: { orderBy: { endDate: 'desc' } },
                certifications: { orderBy: { issueDate: 'desc' } },
            },
        })

        if (!profile) {
            profile = await prisma.applicantProfile.create({
                data: {
                    userId,
                    skills: [],
                },
                include: {
                    workExperiences: { orderBy: { startDate: 'desc' } },
                    educations: { orderBy: { endDate: 'desc' } },
                    certifications: { orderBy: { issueDate: 'desc' } },
                },
            })
        }

        return profile
    } catch (error) {
        reportError(error, {
            scope: 'profile.get-or-create',
            userId,
        })
        return null
    }
}

/**
 * Update personal information
 */
export async function updatePersonalInfo(formData: FormData) {
    const user = await requireCurrentUser({
        roles: ['APPLICANT'],
        permission: 'MANAGE_SELF_PROFILE',
    })
    const userId = user.id

    const rawData = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        phone: formData.get('phone') as string,
        city: formData.get('city') as string,
        country: formData.get('country') as string,
    }

    const result = personalInfoSchema.safeParse(rawData)

    if (!result.success) {
        return {
            success: false,
            error: result.error.errors[0]?.message || 'Invalid data',
        }
    }

    try {
        const profile = await prisma.applicantProfile.update({
            where: { userId },
            data: {
                ...result.data,
                updatedAt: new Date(),
            },
            include: {
                workExperiences: true,
                educations: true,
                certifications: true,
            },
        })

        // Update profile completion
        const completion = calculateProfileCompletion(profile)
        await prisma.applicantProfile.update({
            where: { userId },
            data: { profileCompleteness: completion.percentage },
        })

        revalidatePath('/applicant/profile')
        revalidatePath('/applicant/dashboard')

        await createAuditLog({
            actorUserId: userId,
            action: 'profile.personal-info.updated',
            targetType: 'ApplicantProfile',
            targetId: profile.id,
        })

        await createActivityLog({
            actorUserId: userId,
            description: 'Updated personal information',
        })

        return { success: true }
    } catch (error) {
        reportError(error, {
            scope: 'profile.update-personal-info',
            userId,
        })
        return { success: false, error: 'Failed to update personal information' }
    }
}

/**
 * Update profile links
 */
export async function updateLinks(formData: FormData) {
    const user = await requireCurrentUser({
        roles: ['APPLICANT'],
        permission: 'MANAGE_SELF_PROFILE',
    })
    const userId = user.id

    const rawData = {
        linkedinUrl: formData.get('linkedinUrl') as string,
        githubUrl: formData.get('githubUrl') as string,
        portfolioUrl: formData.get('portfolioUrl') as string,
    }

    const result = linksSchema.safeParse(rawData)

    if (!result.success) {
        return {
            success: false,
            error: result.error.errors[0]?.message || 'Invalid data',
        }
    }

    try {
        const profile = await prisma.applicantProfile.update({
            where: { userId },
            data: {
                ...result.data,
                updatedAt: new Date(),
            },
            include: {
                workExperiences: true,
                educations: true,
                certifications: true,
            },
        })

        // Update profile completion
        const completion = calculateProfileCompletion(profile)
        await prisma.applicantProfile.update({
            where: { userId },
            data: { profileCompleteness: completion.percentage },
        })

        revalidatePath('/applicant/profile')

        await createAuditLog({
            actorUserId: userId,
            action: 'profile.links.updated',
            targetType: 'ApplicantProfile',
            targetId: profile.id,
        })

        return { success: true }
    } catch (error) {
        reportError(error, {
            scope: 'profile.update-links',
            userId,
        })
        return { success: false, error: 'Failed to update links' }
    }
}

/**
 * Update professional summary
 */
export async function updateSummary(formData: FormData) {
    const user = await requireCurrentUser({
        roles: ['APPLICANT'],
        permission: 'MANAGE_SELF_PROFILE',
    })
    const userId = user.id

    const rawData = {
        headline: formData.get('headline') as string,
        bio: formData.get('bio') as string,
    }

    const result = summarySchema.safeParse(rawData)

    if (!result.success) {
        return {
            success: false,
            error: result.error.errors[0]?.message || 'Invalid data',
        }
    }

    try {
        const profile = await prisma.applicantProfile.update({
            where: { userId },
            data: {
                ...result.data,
                updatedAt: new Date(),
            },
            include: {
                workExperiences: true,
                educations: true,
                certifications: true,
            },
        })

        // Update profile completion
        const completion = calculateProfileCompletion(profile)
        await prisma.applicantProfile.update({
            where: { userId },
            data: { profileCompleteness: completion.percentage },
        })

        revalidatePath('/applicant/profile')

        await createAuditLog({
            actorUserId: userId,
            action: 'profile.summary.updated',
            targetType: 'ApplicantProfile',
            targetId: profile.id,
        })

        return { success: true }
    } catch (error) {
        reportError(error, {
            scope: 'profile.update-summary',
            userId,
        })
        return { success: false, error: 'Failed to update summary' }
    }
}

/**
 * Update skills
 */
export async function updateSkills(skills: string[]) {
    const user = await requireCurrentUser({
        roles: ['APPLICANT'],
        permission: 'MANAGE_SELF_PROFILE',
    })
    const userId = user.id

    if (skills.length > 50) {
        return { success: false, error: 'Maximum 50 skills allowed' }
    }

    try {
        const profile = await prisma.applicantProfile.update({
            where: { userId },
            data: {
                skills,
                updatedAt: new Date(),
            },
            include: {
                workExperiences: true,
                educations: true,
                certifications: true,
            },
        })

        // Update profile completion
        const completion = calculateProfileCompletion(profile)
        await prisma.applicantProfile.update({
            where: { userId },
            data: { profileCompleteness: completion.percentage },
        })

        revalidatePath('/applicant/profile')

        await createAuditLog({
            actorUserId: userId,
            action: 'profile.skills.updated',
            targetType: 'ApplicantProfile',
            targetId: profile.id,
            metadata: {
                skillsCount: skills.length,
            },
        })

        return { success: true }
    } catch (error) {
        reportError(error, {
            scope: 'profile.update-skills',
            userId,
        })
        return { success: false, error: 'Failed to update skills' }
    }
}

/**
 * Get dashboard stats for the current user
 */
export async function getDashboardStats() {
    const user = await requireCurrentUser({
        roles: ['APPLICANT'],
        permission: 'VIEW_APPLICANT_DASHBOARD',
    })
    const userId = user.id

    try {
        const [
            profile,
            totalApplications,
            pendingCount,
            reviewingCount,
            shortlistedCount,
            rejectedCount,
            hiredCount,
            recentApplications,
        ] = await Promise.all([
            prisma.applicantProfile.findUnique({
                where: { userId },
                include: {
                    workExperiences: true,
                    educations: true,
                    certifications: true,
                },
            }),
            prisma.application.count({ where: { userId } }),
            prisma.application.count({ where: { userId, status: 'SUBMITTED' } }),
            prisma.application.count({ where: { userId, status: 'UNDER_REVIEW' } }),
            prisma.application.count({ where: { userId, status: 'SHORTLISTED' } }),
            prisma.application.count({ where: { userId, status: 'REJECTED' } }),
            prisma.application.count({ where: { userId, status: 'HIRED' } }),
            prisma.application.findMany({
                where: { userId },
                include: { job: true },
                orderBy: { appliedAt: 'desc' },
                take: 3,
            }),
        ])

        return {
            profile,
            stats: {
                totalApplications,
                submittedApplications: pendingCount,
                reviewingApplications: reviewingCount,
                shortlistedApplications: shortlistedCount,
                rejectedApplications: rejectedCount,
                hiredApplications: hiredCount,
            },
            recentApplications,
        }
    } catch (error) {
        reportError(error, {
            scope: 'dashboard.get-stats',
            userId,
        })
        return null
    }
}

/**
 * Upload and save a CV for the applicant profile
 */
export async function uploadProfileCV(formData: FormData) {
    const user = await requireCurrentUser({
        roles: ['APPLICANT'],
        permission: 'MANAGE_SELF_PROFILE',
    })
    const userId = user.id

    const file = formData.get('cv') as File
    if (!file || file.size === 0) {
        return { success: false, error: 'No file uploaded' }
    }

    try {
        // 1. Validate the file
        validatePrivateUpload(file)

        // 2. Save the file to storage (temporary if transaction fails)
        const storedFile = await savePrivateFile(file, { scan: true })

        try {
            // 3. Update database in a transaction
            await prisma.$transaction(async tx => {
                // Upsert profile (ensure it exists)
                const profile = await tx.applicantProfile.upsert({
                    where: { userId },
                    create: { userId, skills: [] },
                    update: {},
                    include: {
                        workExperiences: true,
                        educations: true,
                        certifications: true,
                    },
                })

                // Create or update CandidateDocument record (using unique constraint)
                await tx.candidateDocument.upsert({
                    where: {
                        applicantProfileId_documentType: {
                            applicantProfileId: profile.id,
                            documentType: 'CV',
                        },
                    },
                    create: {
                        applicantProfileId: profile.id,
                        uploadedByUserId: userId,
                        documentType: 'CV',
                        storageKey: storedFile.storageKey,
                        originalFileName: storedFile.originalFileName,
                        mimeType: storedFile.mimeType,
                        sizeBytes: storedFile.sizeBytes,
                        sha256: storedFile.sha256,
                        scanStatus: storedFile.scanStatus,
                    },
                    update: {
                        storageKey: storedFile.storageKey,
                        originalFileName: storedFile.originalFileName,
                        mimeType: storedFile.mimeType,
                        sizeBytes: storedFile.sizeBytes,
                        sha256: storedFile.sha256,
                        scanStatus: storedFile.scanStatus,
                        updatedAt: new Date(),
                    },
                })

                // Update profile with newest CV info for quick access
                const updatedProfile = await tx.applicantProfile.update({
                    where: { id: profile.id },
                    data: {
                        cvUrl: storedFile.storageKey,
                        cvFileName: storedFile.originalFileName,
                        updatedAt: new Date(),
                    },
                    include: {
                        workExperiences: true,
                        educations: true,
                        certifications: true,
                    },
                })

                // Update profile completion
                const completion = calculateProfileCompletion(updatedProfile)
                await tx.applicantProfile.update({
                    where: { id: profile.id },
                    data: { profileCompleteness: completion.percentage },
                })
            })
        } catch (txError) {
            // cleanup the uploaded file on transaction failures to prevent orphaned blobs
            await removePrivateFile(storedFile.storageKey).catch((err: unknown) => {
                console.error('Failed to cleanup file after transaction error:', err)
            })
            throw txError
        }

        revalidatePath('/applicant/profile')
        revalidatePath('/applicant/upload-cv')

        await createAuditLog({
            actorUserId: userId,
            action: 'profile.cv.uploaded',
            targetType: 'ApplicantProfile',
            metadata: {
                fileName: storedFile.originalFileName,
                sizeBytes: storedFile.sizeBytes,
            },
        })

        await createActivityLog({
            actorUserId: userId,
            description: `Uploaded CV: ${storedFile.originalFileName}`,
        })

        return { success: true }
    } catch (error) {
        reportError(error, {
            scope: 'profile.upload-cv',
            userId,
        })
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to upload CV',
        }
    }
}
