import { headers } from 'next/headers'

export async function getRequestContext() {
  const headerStore = await headers()

  return {
    ipAddress:
      headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headerStore.get('x-real-ip') ??
      'unknown',
    userAgent: headerStore.get('user-agent') ?? 'unknown',
  }
}
