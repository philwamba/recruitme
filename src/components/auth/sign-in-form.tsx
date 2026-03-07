'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signIn } from '@/app/auth/actions'
import { FormSubmitButton } from '@/components/auth/form-submit-button'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { LinkedInAuthButton } from '@/components/auth/linkedin-auth-button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import type { OAuthConfig } from '@/lib/oauth/config'

const initialState = {
    success: false,
    message: '',
    email: '',
}

export function SignInForm({
    nextPath = '',
    oauth,
}: {
    nextPath?: string
    oauth: OAuthConfig
}) {
    const [state, formAction] = useActionState(signIn, initialState)
    const hasSocialLogin = oauth.google || oauth.linkedin

    return (
        <div className="space-y-4">
            {hasSocialLogin && (
                <>
                    <div className="space-y-3">
                        {oauth.google && <GoogleAuthButton nextPath={nextPath} label="Continue with Google" />}
                        {oauth.linkedin && <LinkedInAuthButton nextPath={nextPath} label="Continue with LinkedIn" />}
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
                <div className="space-y-2">
                    <Label htmlFor="email" required>Email Address</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        defaultValue={state.email}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password" required>Password</Label>
                    <PasswordInput
                        id="password"
                        name="password"
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
