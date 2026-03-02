'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signIn } from '@/app/auth/actions'
import { FormSubmitButton } from '@/components/auth/form-submit-button'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { LinkedInAuthButton } from '@/components/auth/linkedin-auth-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState = {
  success: false,
  message: '',
}

export function SignInForm({ nextPath = '' }: { nextPath?: string }) {
  const [state, formAction] = useActionState(signIn, initialState)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <GoogleAuthButton nextPath={nextPath} label="Continue with Google" />
        <LinkedInAuthButton nextPath={nextPath} label="Continue with LinkedIn" />
      </div>
      <div className="relative text-center text-xs uppercase text-muted-foreground">
        <span className="bg-background px-2">Or sign in with email</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-border" />
      </div>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={nextPath} />
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
            autoComplete="current-password"
            required
          />
        </div>
        {state.message ? (
          <p className="text-sm text-destructive">{state.message}</p>
        ) : null}
        <FormSubmitButton idleLabel="Sign in" pendingLabel="Signing in..." />
        <div className="text-right text-sm">
          <Link href="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
      </form>
    </div>
  )
}
