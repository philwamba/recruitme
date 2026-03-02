import type { UserRole } from '@prisma/client'

export function getPostSignInPath(role: UserRole, nextPath: string | null) {
  if (nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')) {
    return nextPath
  }

  if (role === 'ADMIN') {
    return '/admin/dashboard'
  }

  if (role === 'EMPLOYER') {
    return '/employer/dashboard'
  }

  return '/applicant/dashboard'
}
