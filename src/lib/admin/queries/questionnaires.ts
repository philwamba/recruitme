import 'server-only'

import { prisma } from '@/lib/prisma'
import type { QuestionnaireType } from '@prisma/client'

export interface QuestionnairesQueryParams {
    type?: QuestionnaireType
    isActive?: boolean
    page?: number
    limit?: number
}

export async function getQuestionnaires(params: QuestionnairesQueryParams = {}) {
    const { type, isActive, page = 1, limit = 20 } = params
    const skip = (page - 1) * limit

    const where = {
        ...(type && { type }),
        ...(isActive !== undefined && { isActive }),
    }

    const [questionnaires, totalCount] = await Promise.all([
        prisma.questionnaire.findMany({
            where,
            skip,
            take: limit,
            orderBy: [{ type: 'asc' }, { name: 'asc' }],
            include: {
                _count: {
                    select: {
                        questions: true,
                        responses: true,
                    },
                },
            },
        }),
        prisma.questionnaire.count({ where }),
    ])

    return {
        questionnaires,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page,
    }
}

export async function getQuestionnaireById(id: string) {
    return prisma.questionnaire.findUnique({
        where: { id },
        include: {
            questions: {
                orderBy: { sortOrder: 'asc' },
            },
            _count: {
                select: {
                    responses: true,
                },
            },
        },
    })
}

export async function getQuestionnaireByCode(code: string) {
    return prisma.questionnaire.findUnique({
        where: { code },
        include: {
            questions: {
                orderBy: { sortOrder: 'asc' },
            },
        },
    })
}

export async function getQuestionnaireResponses(questionnaireId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    const [responses, totalCount] = await Promise.all([
        prisma.questionnaireResponse.findMany({
            where: { questionnaireId },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                respondentUser: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
                application: {
                    select: {
                        id: true,
                        trackingId: true,
                        job: {
                            select: {
                                title: true,
                            },
                        },
                    },
                },
                answers: {
                    include: {
                        question: {
                            select: {
                                text: true,
                                type: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.questionnaireResponse.count({ where: { questionnaireId } }),
    ])

    return {
        responses,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page,
    }
}

export async function getQuestionnairesForSelect() {
    return prisma.questionnaire.findMany({
        where: { isActive: true },
        select: {
            id: true,
            name: true,
            code: true,
            type: true,
        },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
    })
}
