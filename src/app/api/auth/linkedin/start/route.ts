import { NextResponse } from 'next/server'
import { createLinkedInAuthorizationUrl, isLinkedInOAuthConfigured } from '@/lib/oauth/linkedin'

export async function GET(request: Request) {
    if (!isLinkedInOAuthConfigured()) {
        return NextResponse.redirect(new URL('/sign-in?error=linkedin-not-configured', request.url))
    }

    const { searchParams } = new URL(request.url)
    const nextPath = searchParams.get('next')
    const authorizationUrl = await createLinkedInAuthorizationUrl(nextPath)

    return NextResponse.redirect(authorizationUrl)
}
