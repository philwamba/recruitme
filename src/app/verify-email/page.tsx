import Link from 'next/link'
import { verifyEmail } from '@/app/auth/actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function VerifyEmailPage({
    searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
    const params = await searchParams
    const token = params.token ?? ''

    let success = false
    if (token) {
        try {
            success = await verifyEmail(token)
        } catch {
            success = false
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{success ? 'Email verified' : 'Verification failed'}</CardTitle>
                    <CardDescription>
                        {success
                            ? 'Your account is ready for sign-in.'
                            : 'That verification link is invalid or expired.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    {success
                        ? 'You can now access your account with your verified email address.'
                        : 'Request a new verification link by creating a new account or contacting support.'}
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/sign-in">Go to sign in</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
