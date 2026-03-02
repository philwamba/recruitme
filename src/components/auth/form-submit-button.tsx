'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'

interface FormSubmitButtonProps {
  idleLabel: string
  pendingLabel: string
}

export function FormSubmitButton({
    idleLabel,
    pendingLabel,
}: FormSubmitButtonProps) {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? pendingLabel : idleLabel}
        </Button>
    )
}
