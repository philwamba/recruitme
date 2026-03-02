'use client'

import { useActionState } from 'react'
import { resetPassword } from '@/app/auth/actions'
import { FormSubmitButton } from '@/components/auth/form-submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState = {
    success: false,
    message: '',
}

export function ResetPasswordForm({ token }: { token: string }) {
    const [state, formAction] = useActionState(resetPassword, initialState)

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            <div className="space-y-2">
                <Label htmlFor="password" required>New password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                />
            </div>
            {state.message ? (
                <p className={`text-sm ${state.success ? 'text-emerald-600' : 'text-destructive'}`}>
                    {state.message}
                </p>
            ) : null}
            <FormSubmitButton idleLabel="Update password" pendingLabel="Updating..." />
        </form>
    )
}
