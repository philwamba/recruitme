import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getOAuthConfig } from '@/lib/oauth/config'
import { AuthCard } from '@/components/auth/auth-card'
import { SignInForm } from '@/components/auth/sign-in-form'

export default async function SignInPage({
    searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
    const user = await getCurrentUser()
    const params = await searchParams

    if (user) {
        redirect(
            user.role === 'ADMIN'
                ? '/admin/dashboard'
                : user.role === 'EMPLOYER'
                    ? '/employer/dashboard'
                    : '/applicant/dashboard',
        )
    }

    const oauthConfig = getOAuthConfig()

    return (
        <AuthCard
            title="Sign in"
            description="Access your recruitment workspace securely."
            footerText="Need an account?"
            footerLinkLabel="Create one"
            footerLinkHref="/sign-up"
        >
            <SignInForm nextPath={params.next ?? ''} oauth={oauthConfig} />
        </AuthCard>
    )
}
