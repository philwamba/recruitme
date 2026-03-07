'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import { createAuditLog } from '@/lib/observability/audit'
import { ROUTES } from '@/lib/constants/routes'
import type { FieldMapping, ImportRow } from '@/lib/admin/validations/candidate-import'
import { importRowSchema } from '@/lib/admin/validations/candidate-import'

interface CreateImportParams {
    fileName: string
    storageKey: string
    totalRows: number
    fieldMapping: FieldMapping
    jobId?: string
}

export async function createCandidateImport(params: CreateImportParams) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    const candidateImport = await prisma.candidateImport.create({
        data: {
            fileName: params.fileName,
            storageKey: params.storageKey,
            totalRows: params.totalRows,
            fieldMapping: params.fieldMapping,
            jobId: params.jobId || null,
            importedById: user.id,
            status: 'PENDING',
        },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'CREATE',
        targetType: 'CandidateImport',
        targetId: candidateImport.id,
        metadata: {
            fileName: params.fileName,
            totalRows: params.totalRows,
        },
    })

    revalidatePath(ROUTES.ADMIN.CANDIDATES)
    return { success: true, id: candidateImport.id }
}

interface ProcessImportParams {
    importId: string
    rows: Record<string, string>[] // Raw CSV rows
    fieldMapping: FieldMapping
    skipDuplicates: boolean
    jobId?: string
}

interface ImportError {
    row: number
    field: string
    message: string
}

export async function processImport(params: ProcessImportParams) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    const candidateImport = await prisma.candidateImport.findUnique({
        where: { id: params.importId },
    })

    if (!candidateImport) {
        throw new Error('Import not found')
    }

    if (candidateImport.importedById !== user.id) {
        throw new Error('Unauthorized')
    }

    // Update status to processing
    await prisma.candidateImport.update({
        where: { id: params.importId },
        data: {
            status: 'PROCESSING',
            startedAt: new Date(),
        },
    })

    const errors: ImportError[] = []
    let successCount = 0
    let processedRows = 0

    // Process each row
    for (let i = 0; i < params.rows.length; i++) {
        const rawRow = params.rows[i]
        processedRows++

        try {
            // Map CSV columns to candidate fields
            const mappedRow: Partial<ImportRow> = {}
            for (const [csvColumn, candidateField] of Object.entries(params.fieldMapping)) {
                if (candidateField && rawRow[csvColumn] !== undefined) {
                    (mappedRow as Record<string, string>)[candidateField] = rawRow[csvColumn]
                }
            }

            // Validate the mapped row
            const validationResult = importRowSchema.safeParse(mappedRow)
            if (!validationResult.success) {
                const fieldErrors = validationResult.error.errors
                for (const error of fieldErrors) {
                    errors.push({
                        row: i + 2, // +2 for 1-based indexing and header row
                        field: error.path.join('.'),
                        message: error.message,
                    })
                }
                continue
            }

            const validRow = validationResult.data

            // Check for existing user
            const existingUser = await prisma.user.findUnique({
                where: { email: validRow.email },
            })

            if (existingUser && params.skipDuplicates) {
                // Skip duplicate
                continue
            }

            // Create or update user and profile
            const userResult = await prisma.user.upsert({
                where: { email: validRow.email },
                create: {
                    email: validRow.email,
                    role: 'APPLICANT',
                    applicantProfile: {
                        create: {
                            firstName: validRow.firstName,
                            lastName: validRow.lastName,
                            phone: validRow.phone,
                            city: validRow.city,
                            country: validRow.country,
                            headline: validRow.headline,
                            linkedinUrl: validRow.linkedinUrl || null,
                            githubUrl: validRow.githubUrl || null,
                            portfolioUrl: validRow.portfolioUrl || null,
                            skills: validRow.skills
                                ? validRow.skills.split(',').map(s => s.trim()).filter(Boolean)
                                : [],
                        },
                    },
                },
                update: {
                    applicantProfile: {
                        upsert: {
                            create: {
                                firstName: validRow.firstName,
                                lastName: validRow.lastName,
                                phone: validRow.phone,
                                city: validRow.city,
                                country: validRow.country,
                                headline: validRow.headline,
                                linkedinUrl: validRow.linkedinUrl || null,
                                githubUrl: validRow.githubUrl || null,
                                portfolioUrl: validRow.portfolioUrl || null,
                                skills: validRow.skills
                                    ? validRow.skills.split(',').map(s => s.trim()).filter(Boolean)
                                    : [],
                            },
                            update: {
                                firstName: validRow.firstName ?? undefined,
                                lastName: validRow.lastName ?? undefined,
                                phone: validRow.phone ?? undefined,
                                city: validRow.city ?? undefined,
                                country: validRow.country ?? undefined,
                                headline: validRow.headline ?? undefined,
                                linkedinUrl: validRow.linkedinUrl || undefined,
                                githubUrl: validRow.githubUrl || undefined,
                                portfolioUrl: validRow.portfolioUrl || undefined,
                                skills: validRow.skills
                                    ? validRow.skills.split(',').map(s => s.trim()).filter(Boolean)
                                    : undefined,
                            },
                        },
                    },
                },
            })

            // If a job is specified, create an application
            if (params.jobId) {
                const existingApplication = await prisma.application.findUnique({
                    where: {
                        userId_jobId: {
                            userId: userResult.id,
                            jobId: params.jobId,
                        },
                    },
                })

                if (!existingApplication) {
                    await prisma.application.create({
                        data: {
                            userId: userResult.id,
                            jobId: params.jobId,
                            trackingId: `IMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            status: 'SUBMITTED',
                            source: validRow.source || 'IMPORT',
                            submittedAt: new Date(),
                        },
                    })
                }
            }

            successCount++
        } catch (error) {
            errors.push({
                row: i + 2,
                field: 'general',
                message: error instanceof Error ? error.message : 'Unknown error',
            })
        }

        // Update progress periodically
        if (processedRows % 10 === 0) {
            await prisma.candidateImport.update({
                where: { id: params.importId },
                data: {
                    processedRows,
                    successCount,
                    errorCount: errors.length,
                },
            })
        }
    }

    // Final update
    const finalStatus = errors.length === 0
        ? 'COMPLETED'
        : successCount > 0
            ? 'PARTIAL'
            : 'FAILED'

    await prisma.candidateImport.update({
        where: { id: params.importId },
        data: {
            status: finalStatus,
            processedRows,
            successCount,
            errorCount: errors.length,
            errors: errors.length > 0 ? errors : null,
            completedAt: new Date(),
        },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'PROCESS_IMPORT',
        targetType: 'CandidateImport',
        targetId: params.importId,
        metadata: {
            status: finalStatus,
            successCount,
            errorCount: errors.length,
        },
    })

    revalidatePath(ROUTES.ADMIN.CANDIDATES)

    return {
        success: true,
        status: finalStatus,
        successCount,
        errorCount: errors.length,
        errors: errors.slice(0, 100), // Limit errors returned
    }
}

export async function deleteCandidateImport(id: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    const candidateImport = await prisma.candidateImport.findUnique({
        where: { id },
    })

    if (!candidateImport) {
        throw new Error('Import not found')
    }

    if (candidateImport.importedById !== user.id) {
        throw new Error('Unauthorized')
    }

    await prisma.candidateImport.delete({
        where: { id },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'DELETE',
        targetType: 'CandidateImport',
        targetId: id,
    })

    revalidatePath(ROUTES.ADMIN.CANDIDATES)
    return { success: true }
}
