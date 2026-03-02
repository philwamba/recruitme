'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { UserRole } from '@prisma/client'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/observability/audit'
import { retryOutboxJob } from '@/lib/services/outbox'

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

  // Prevent self-demotion
  if (targetUserId === user.id && role !== 'ADMIN') {
    redirect('/admin/users?error=cannot-demote-self')
  }

  // Prevent removal of last admin
  if (role !== 'ADMIN') {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true },
    })

    if (targetUser?.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
      })

      if (adminCount === 1) {
        redirect('/admin/users?error=cannot-remove-last-admin')
      }
    }
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

export async function retryFailedOutboxJob(formData: FormData) {
  const user = await requireCurrentUser({
    roles: ['ADMIN'],
    permission: 'VIEW_AUDIT_LOGS',
  })

  const jobId = String(formData.get('jobId') ?? '')

  if (!jobId) {
    redirect('/admin/operations?error=invalid-job')
  }

  try {
    await retryOutboxJob(jobId)
  } catch {
    redirect('/admin/operations?error=retry-failed')
  }

  await createAuditLog({
    actorUserId: user.id,
    action: 'outbox.retry.requested',
    targetType: 'OutboxJob',
    targetId: jobId,
  })

  revalidatePath('/admin/operations')
  redirect('/admin/operations?status=job-requeued')
}
