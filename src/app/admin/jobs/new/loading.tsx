import { FormSkeleton } from '@/components/admin'

export default function NewJobLoading() {
    return <FormSkeleton sections={3} fieldsPerSection={4} />
}
