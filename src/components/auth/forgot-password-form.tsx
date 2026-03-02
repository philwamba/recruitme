'use client'

import { useActionState } from 'react'
import { requestPasswordReset } from '@/app/auth/actions'
import { FormSubmitButton } from '@/components/auth/form-submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState = {
  success: false,
  message: '',
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" required>Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {state.message ? (
        <p className={`text-sm ${state.success ? 'text-emerald-600' : 'text-destructive'}`}>
          {state.message}
        </p>
      ) : null}
      <FormSubmitButton idleLabel="Request reset link" pendingLabel="Processing..." />
    </form>
  )
}
