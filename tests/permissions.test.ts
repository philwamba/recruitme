import test from 'node:test'
import assert from 'node:assert/strict'
import { getPermissionsForRole, roleHasPermission } from '../src/lib/security/permissions.ts'

test('admin has system management permission', () => {
  assert.equal(roleHasPermission('ADMIN', 'MANAGE_SYSTEM_SETTINGS'), true)
})

test('applicant permissions are scoped to self-service operations', () => {
  const permissions = getPermissionsForRole('APPLICANT')

  assert.deepEqual(permissions.sort(), [
    'MANAGE_SELF_PROFILE',
    'VIEW_APPLICANT_DASHBOARD',
  ])
})
