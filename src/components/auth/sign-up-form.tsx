'use client'

import { useActionState } from 'react'
import { signUp } from '@/app/auth/actions'
import { FormSubmitButton } from '@/components/auth/form-submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState = {
  success: false,
  message: '',
}

export function SignUpForm() {
  const [state, formAction] = useActionState(signUp, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Use at least 12 characters with uppercase, lowercase, and numbers.
      </p>
      {state.message ? (
        <p className={`text-sm ${state.success ? 'text-emerald-600' : 'text-destructive'}`}>
          {state.message}
        </p>
      ) : null}
      <FormSubmitButton idleLabel="Create account" pendingLabel="Creating account..." />
    </form>
  )
}
