import { headers } from 'next/headers'

export async function getRequestContext() {
  const headerStore = await headers()

  return {
    // Return null when IP cannot be determined so callers can use fallback keys (e.g., email-based)
    ipAddress:
      headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headerStore.get('x-real-ip') ??
      null,
    userAgent: headerStore.get('user-agent') ?? 'unknown',
  }
}
