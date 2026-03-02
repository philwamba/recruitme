'use client'

import { useActionState } from 'react'
import { signUp } from '@/app/auth/actions'
import { FormSubmitButton } from '@/components/auth/form-submit-button'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { LinkedInAuthButton } from '@/components/auth/linkedin-auth-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState = {
  success: false,
  message: '',
}

export function SignUpForm({ nextPath = '' }: { nextPath?: string }) {
  const [state, formAction] = useActionState(signUp, initialState)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <GoogleAuthButton nextPath={nextPath} label="Create account with Google" />
        <LinkedInAuthButton nextPath={nextPath} label="Create account with LinkedIn" />
      </div>
      <div className="relative text-center text-xs uppercase text-muted-foreground">
        <span className="bg-background px-2">Or register with email</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-border" />
      </div>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={nextPath} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName" required>First name</Label>
            <Input id="firstName" name="firstName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" required>Last name</Label>
            <Input id="lastName" name="lastName" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" required>Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" required>Password</Label>
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
    </div>
  )
}
