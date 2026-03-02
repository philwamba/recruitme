import { NextResponse } from 'next/server'
import { createGoogleAuthorizationUrl, isGoogleOAuthConfigured } from '@/lib/oauth/google'

export async function GET(request: Request) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(new URL('/sign-in?error=google-not-configured', request.url))
  }

  const { searchParams } = new URL(request.url)
  const nextPath = searchParams.get('next')
  const authorizationUrl = await createGoogleAuthorizationUrl(nextPath)

  return NextResponse.redirect(authorizationUrl)
}
