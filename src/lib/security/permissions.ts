import type { Permission, UserRole } from '@prisma/client'

const ROLE_PERMISSIONS: Readonly<Record<UserRole, readonly Permission[]>> = Object.freeze({
  ADMIN: Object.freeze([
    'VIEW_APPLICANT_DASHBOARD',
    'MANAGE_SELF_PROFILE',
    'MANAGE_JOBS',
    'MANAGE_APPLICATIONS',
    'MANAGE_USERS',
    'VIEW_AUDIT_LOGS',
    'MANAGE_SYSTEM_SETTINGS',
  ] as const),
  EMPLOYER: Object.freeze([
    'MANAGE_JOBS',
    'MANAGE_APPLICATIONS',
  ] as const),
  APPLICANT: Object.freeze([
    'VIEW_APPLICANT_DASHBOARD',
    'MANAGE_SELF_PROFILE',
  ] as const),
})

export function getPermissionsForRole(role: UserRole): Permission[] {
  // Return a defensive copy so callers cannot mutate internal state
  return [...ROLE_PERMISSIONS[role]]
}

export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}
