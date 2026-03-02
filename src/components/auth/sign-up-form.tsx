'use client'

import { useActionState } from 'react'
import { signUp } from '@/app/auth/actions'
import { FormSubmitButton } from '@/components/auth/form-submit-button'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { LinkedInAuthButton } from '@/components/auth/linkedin-auth-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { OAuthConfig } from '@/lib/oauth/config'

const initialState = {
    success: false,
    message: '',
}

export function SignUpForm({
    nextPath = '',
    oauth,
}: {
    nextPath?: string
    oauth: OAuthConfig
}) {
    const [state, formAction] = useActionState(signUp, initialState)
    const hasSocialLogin = oauth.google || oauth.linkedin

    return (
        <div className="space-y-4">
            {hasSocialLogin && (
                <>
                    <div className="space-y-3">
                        {oauth.google && <GoogleAuthButton nextPath={nextPath} label="Create account with Google" />}
                        {oauth.linkedin && <LinkedInAuthButton nextPath={nextPath} label="Create account with LinkedIn" />}
                    </div>
                    <div className="relative flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="h-px flex-1 bg-border" />
                        <span className="uppercase tracking-widest">or</span>
                        <div className="h-px flex-1 bg-border" />
                    </div>
                </>
            )}
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
