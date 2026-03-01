'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import { certificationSchema } from '@/lib/validations/certification'
import { createActivityLog, createAuditLog } from '@/lib/observability/audit'
import { reportError } from '@/lib/observability/error-reporting'

/**
 * Create a new certification entry
 */
export async function createCertification(formData: FormData) {
  const user = await requireCurrentUser({
    roles: ['APPLICANT'],
    permission: 'MANAGE_SELF_PROFILE',
  })
  const userId = user.id

  const rawData = {
    name: formData.get('name') as string,
    issuingOrg: formData.get('issuingOrg') as string,
    issueDate: formData.get('issueDate')
      ? new Date(formData.get('issueDate') as string)
      : null,
    expirationDate: formData.get('expirationDate')
      ? new Date(formData.get('expirationDate') as string)
      : null,
    credentialUrl: formData.get('credentialUrl') as string,
  }

  const result = certificationSchema.safeParse(rawData)

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0]?.message || 'Invalid data',
    }
  }

  try {
    const profile = await prisma.applicantProfile.findUnique({
      where: { userId },
    })

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    await prisma.certification.create({
      data: {
        applicantProfileId: profile.id,
        ...result.data,
      },
    })

    revalidatePath('/applicant/profile')

    await createActivityLog({
      actorUserId: userId,
      description: 'Added certification',
    })

    return { success: true }
  } catch (error) {
    reportError(error, {
      scope: 'certification.create',
      userId,
    })
    return { success: false, error: 'Failed to create certification' }
  }
}

/**
 * Update an existing certification entry
 */
export async function updateCertification(id: string, formData: FormData) {
  const user = await requireCurrentUser({
    roles: ['APPLICANT'],
    permission: 'MANAGE_SELF_PROFILE',
  })
  const userId = user.id

  const rawData = {
    name: formData.get('name') as string,
    issuingOrg: formData.get('issuingOrg') as string,
    issueDate: formData.get('issueDate')
      ? new Date(formData.get('issueDate') as string)
      : null,
    expirationDate: formData.get('expirationDate')
      ? new Date(formData.get('expirationDate') as string)
      : null,
    credentialUrl: formData.get('credentialUrl') as string,
  }

  const result = certificationSchema.safeParse(rawData)

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0]?.message || 'Invalid data',
    }
  }

  try {
    // Verify ownership
    const certification = await prisma.certification.findUnique({
      where: { id },
      include: { applicantProfile: true },
    })

    if (!certification || certification.applicantProfile.userId !== userId) {
      return { success: false, error: 'Certification not found' }
    }

    await prisma.certification.update({
      where: { id },
      data: result.data,
    })

    revalidatePath('/applicant/profile')

    await createActivityLog({
      actorUserId: userId,
      description: 'Updated certification',
    })

    return { success: true }
  } catch (error) {
    reportError(error, {
      scope: 'certification.update',
      userId,
      metadata: { certificationId: id },
    })
    return { success: false, error: 'Failed to update certification' }
  }
}

/**
 * Delete a certification entry
 */
export async function deleteCertification(id: string) {
  const user = await requireCurrentUser({
    roles: ['APPLICANT'],
    permission: 'MANAGE_SELF_PROFILE',
  })
  const userId = user.id

  try {
    // Verify ownership
    const certification = await prisma.certification.findUnique({
      where: { id },
      include: { applicantProfile: true },
    })

    if (!certification || certification.applicantProfile.userId !== userId) {
      return { success: false, error: 'Certification not found' }
    }

    await prisma.certification.delete({ where: { id } })

    revalidatePath('/applicant/profile')

    await createAuditLog({
      actorUserId: userId,
      action: 'profile.certification.deleted',
      targetType: 'Certification',
      targetId: id,
    })

    return { success: true }
  } catch (error) {
    reportError(error, {
      scope: 'certification.delete',
      userId,
      metadata: { certificationId: id },
    })
    return { success: false, error: 'Failed to delete certification' }
  }
}
