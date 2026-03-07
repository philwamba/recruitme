import { z } from 'zod'

export const jobPipelineStageSchema = z.object({
    id: z.string().optional(),
    name: z.string().trim().min(1, 'Stage name is required').max(50, 'Stage name is too long'),
    order: z.number().int().min(1),
    isDefault: z.boolean().default(false),
})

export const jobPipelineFormSchema = z.object({
    stages: z
        .array(jobPipelineStageSchema)
        .min(1, 'At least one stage is required')
        .refine(
            (stages) => stages.filter((s) => s.isDefault).length <= 1,
            'Only one stage can be the default entry point',
        ),
})

export type JobPipelineStageData = z.infer<typeof jobPipelineStageSchema>
export type JobPipelineFormData = z.infer<typeof jobPipelineFormSchema>
