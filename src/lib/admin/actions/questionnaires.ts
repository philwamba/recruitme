'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import { createAuditLog } from '@/lib/observability/audit'
import {
    questionnaireFormSchema,
    questionFormSchema,
    type QuestionnaireFormData,
    type QuestionFormData,
} from '@/lib/admin/validations/questionnaire'
import { ROUTES } from '@/lib/constants/routes'

export async function createQuestionnaire(data: QuestionnaireFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_SYSTEM_SETTINGS',
    })

    const validated = questionnaireFormSchema.parse(data)

    // Check for duplicate code
    const existing = await prisma.questionnaire.findUnique({
        where: { code: validated.code },
    })

    if (existing) {
        throw new Error('Questionnaire code already exists')
    }

    const questionnaire = await prisma.questionnaire.create({
        data: {
            name: validated.name,
            code: validated.code,
            description: validated.description || null,
            type: validated.type,
            isActive: validated.isActive,
        },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'CREATE',
        targetType: 'Questionnaire',
        targetId: questionnaire.id,
        metadata: { name: questionnaire.name, code: questionnaire.code },
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES)
    redirect(`${ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES}/${questionnaire.id}`)
}

export async function updateQuestionnaire(id: string, data: QuestionnaireFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_SYSTEM_SETTINGS',
    })

    const existing = await prisma.questionnaire.findUnique({
        where: { id },
    })

    if (!existing) {
        throw new Error('Questionnaire not found')
    }

    const validated = questionnaireFormSchema.parse(data)

    // Check for duplicate code (excluding current)
    const duplicate = await prisma.questionnaire.findFirst({
        where: {
            code: validated.code,
            id: { not: id },
        },
    })

    if (duplicate) {
        throw new Error('Questionnaire code already exists')
    }

    const questionnaire = await prisma.questionnaire.update({
        where: { id },
        data: {
            name: validated.name,
            code: validated.code,
            description: validated.description || null,
            type: validated.type,
            isActive: validated.isActive,
        },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'UPDATE',
        targetType: 'Questionnaire',
        targetId: id,
        metadata: { name: questionnaire.name, code: questionnaire.code },
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES)
    return { success: true }
}

export async function deleteQuestionnaire(id: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_SYSTEM_SETTINGS',
    })

    const existing = await prisma.questionnaire.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    responses: true,
                },
            },
        },
    })

    if (!existing) {
        throw new Error('Questionnaire not found')
    }

    if (existing._count.responses > 0) {
        throw new Error('Cannot delete questionnaire with responses')
    }

    await prisma.questionnaire.delete({
        where: { id },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'DELETE',
        targetType: 'Questionnaire',
        targetId: id,
        metadata: { name: existing.name, code: existing.code },
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES)
    redirect(ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES)
}

// Question management
export async function createQuestion(questionnaireId: string, data: QuestionFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_SYSTEM_SETTINGS',
    })

    const validated = questionFormSchema.parse(data)

    const questionnaire = await prisma.questionnaire.findUnique({
        where: { id: questionnaireId },
    })

    if (!questionnaire) {
        throw new Error('Questionnaire not found')
    }

    const question = await prisma.questionnaireQuestion.create({
        data: {
            questionnaireId,
            text: validated.text,
            type: validated.type,
            options: validated.options ? (validated.options as Prisma.InputJsonValue) : Prisma.JsonNull,
            isRequired: validated.isRequired,
            helpText: validated.helpText || null,
            sortOrder: validated.sortOrder,
            validations: validated.validations
                ? (validated.validations as Prisma.InputJsonValue)
                : Prisma.JsonNull,
        },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'CREATE',
        targetType: 'QuestionnaireQuestion',
        targetId: question.id,
        metadata: { questionnaireId, text: validated.text.substring(0, 50) },
    })

    revalidatePath(`${ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES}/${questionnaireId}`)
    return { success: true, id: question.id }
}

export async function updateQuestion(id: string, data: QuestionFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_SYSTEM_SETTINGS',
    })

    const existing = await prisma.questionnaireQuestion.findUnique({
        where: { id },
    })

    if (!existing) {
        throw new Error('Question not found')
    }

    const validated = questionFormSchema.parse(data)

    await prisma.questionnaireQuestion.update({
        where: { id },
        data: {
            text: validated.text,
            type: validated.type,
            options: validated.options ? (validated.options as Prisma.InputJsonValue) : Prisma.JsonNull,
            isRequired: validated.isRequired,
            helpText: validated.helpText || null,
            sortOrder: validated.sortOrder,
            validations: validated.validations
                ? (validated.validations as Prisma.InputJsonValue)
                : Prisma.JsonNull,
        },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'UPDATE',
        targetType: 'QuestionnaireQuestion',
        targetId: id,
        metadata: { text: validated.text.substring(0, 50) },
    })

    revalidatePath(`${ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES}/${existing.questionnaireId}`)
    return { success: true }
}

export async function deleteQuestion(id: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_SYSTEM_SETTINGS',
    })

    const existing = await prisma.questionnaireQuestion.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    answers: true,
                },
            },
        },
    })

    if (!existing) {
        throw new Error('Question not found')
    }

    if (existing._count.answers > 0) {
        throw new Error('Cannot delete question with answers')
    }

    await prisma.questionnaireQuestion.delete({
        where: { id },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'DELETE',
        targetType: 'QuestionnaireQuestion',
        targetId: id,
    })

    revalidatePath(`${ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES}/${existing.questionnaireId}`)
    return { success: true }
}

export async function reorderQuestions(questionnaireId: string, questionIds: string[]) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_SYSTEM_SETTINGS',
    })

    // Check for duplicate IDs in input
    const uniqueInputIds = new Set(questionIds)
    if (uniqueInputIds.size !== questionIds.length) {
        throw new Error('Duplicate question IDs in reorder payload')
    }

    // Verify all questions belong to this questionnaire
    const questionnaireQuestions = await prisma.questionnaireQuestion.findMany({
        where: { questionnaireId },
        select: { id: true },
    })
    const validQuestionIds = new Set(questionnaireQuestions.map(q => q.id))

    if (questionIds.length !== validQuestionIds.size || !questionIds.every(id => validQuestionIds.has(id))) {
        throw new Error('Invalid question IDs provided for reordering')
    }

    await prisma.$transaction(
        questionIds.map((id, index) =>
            prisma.questionnaireQuestion.update({
                where: { id, questionnaireId },
                data: { sortOrder: index },
            }),
        ),
    )

    await createAuditLog({
        actorUserId: user.id,
        action: 'REORDER',
        targetType: 'QuestionnaireQuestion',
        targetId: questionnaireId,
        metadata: { questionCount: questionIds.length },
    })

    revalidatePath(`${ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES}/${questionnaireId}`)
    return { success: true }
}
