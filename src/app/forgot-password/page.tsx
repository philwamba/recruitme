import { AuthCard } from '@/components/auth/auth-card'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset password"
      description="Request a password reset link."
      footerText="Remembered your password?"
      footerLinkLabel="Back to sign in"
      footerLinkHref="/sign-in"
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}
