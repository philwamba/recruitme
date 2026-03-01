import { AuthCard } from '@/components/auth/auth-card'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams

  return (
    <AuthCard
      title="Choose a new password"
      description="Complete your password reset securely."
      footerText="Need to request a new link?"
      footerLinkLabel="Request reset"
      footerLinkHref="/forgot-password"
    >
      <ResetPasswordForm token={params.token ?? ''} />
    </AuthCard>
  )
}
