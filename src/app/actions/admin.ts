'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { UserRole } from '@prisma/client'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/observability/audit'

export async function updateUserRole(formData: FormData) {
  const user = await requireCurrentUser({
    roles: ['ADMIN'],
    permission: 'MANAGE_USERS',
  })

  const targetUserId = String(formData.get('userId') ?? '')
  const role = String(formData.get('role') ?? '') as UserRole

  if (!targetUserId || !Object.values(UserRole).includes(role)) {
    redirect('/admin/users?error=invalid-role')
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role },
  })

  await createAuditLog({
    actorUserId: user.id,
    action: 'user.role.updated',
    targetType: 'User',
    targetId: targetUserId,
    metadata: { role },
  })

  revalidatePath('/admin/users')
  redirect('/admin/users?status=role-updated')
}
