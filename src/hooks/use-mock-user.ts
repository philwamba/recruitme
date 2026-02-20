'use client'

import { UserRole } from '@/types/profile'
import { MOCK_USER_ID } from '@/lib/auth'

export interface MockUser {
  id: string
  email: string
  role: UserRole
  name: string
}

const mockUser: MockUser = {
  id: MOCK_USER_ID,
  email: 'demo@recruitme.com',
  role: 'APPLICANT',
  name: 'Demo User',
}

/**
 * Hook to get the current mock user.
 * Replace with actual auth when implementing authentication.
 */
export function useMockUser(): MockUser {
  return mockUser
}
