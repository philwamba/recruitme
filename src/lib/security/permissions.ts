import type { Permission, UserRole } from '@prisma/client'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'VIEW_APPLICANT_DASHBOARD',
    'MANAGE_SELF_PROFILE',
    'MANAGE_JOBS',
    'MANAGE_APPLICATIONS',
    'MANAGE_USERS',
    'VIEW_AUDIT_LOGS',
    'MANAGE_SYSTEM_SETTINGS',
  ],
  EMPLOYER: [
    'MANAGE_JOBS',
    'MANAGE_APPLICATIONS',
  ],
  APPLICANT: [
    'VIEW_APPLICANT_DASHBOARD',
    'MANAGE_SELF_PROFILE',
  ],
}

export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role]
}

export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}
