import { KanbanSkeleton } from '@/components/admin'

export default function PipelineKanbanLoading() {
    return <KanbanSkeleton columns={5} cardsPerColumn={3} />
}
