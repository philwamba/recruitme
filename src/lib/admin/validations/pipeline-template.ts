import { z } from 'zod'

export const pipelineTemplateStageSchema = z.object({
    id: z.string().optional(),
    name: z.string().trim().min(1, 'Stage name is required').max(50, 'Stage name is too long'),
    order: z.number().int().min(1),
    isDefault: z.boolean(),
})

export const pipelineTemplateFormSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
    description: z.string().trim().max(500, 'Description is too long').optional().nullable(),
    isDefault: z.boolean(),
    isActive: z.boolean(),
    stages: z
        .array(pipelineTemplateStageSchema)
        .min(1, 'At least one stage is required')
        .refine(
            stages => stages.filter(s => s.isDefault).length <= 1,
            'Only one stage can be the default entry point',
        ),
})

export type PipelineTemplateStageData = z.infer<typeof pipelineTemplateStageSchema>
export type PipelineTemplateFormData = z.infer<typeof pipelineTemplateFormSchema>
