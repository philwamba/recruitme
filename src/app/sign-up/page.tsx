import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { AuthCard } from '@/components/auth/auth-card'
import { SignUpForm } from '@/components/auth/sign-up-form'

export default async function SignUpPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect(
      user.role === 'ADMIN'
        ? '/admin/dashboard'
        : user.role === 'EMPLOYER'
        ? '/employer/dashboard'
        : '/applicant/dashboard'
    )
  }

  return (
    <AuthCard
      title="Create account"
      description="Register as a candidate with secure credentials."
      footerText="Already have an account?"
      footerLinkLabel="Sign in"
      footerLinkHref="/sign-in"
    >
      <SignUpForm />
    </AuthCard>
  )
}
