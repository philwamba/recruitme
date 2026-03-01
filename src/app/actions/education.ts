'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import { educationSchema } from '@/lib/validations/education'
import { calculateProfileCompletion } from '@/lib/services/profile-completion'
import { createActivityLog, createAuditLog } from '@/lib/observability/audit'
import { reportError } from '@/lib/observability/error-reporting'

/**
 * Create a new education entry
 */
export async function createEducation(formData: FormData) {
  const user = await requireCurrentUser({
    roles: ['APPLICANT'],
    permission: 'MANAGE_SELF_PROFILE',
  })
  const userId = user.id

  const rawData = {
    institution: formData.get('institution') as string,
    degree: formData.get('degree') as string,
    fieldOfStudy: formData.get('fieldOfStudy') as string,
    startDate: formData.get('startDate')
      ? new Date(formData.get('startDate') as string)
      : null,
    endDate: formData.get('endDate')
      ? new Date(formData.get('endDate') as string)
      : null,
    description: formData.get('description') as string,
  }

  const result = educationSchema.safeParse(rawData)

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

    await prisma.education.create({
      data: {
        applicantProfileId: profile.id,
        ...result.data,
      },
    })

    // Update profile completion
    const updatedProfile = await prisma.applicantProfile.findUnique({
      where: { userId },
      include: {
        workExperiences: true,
        educations: true,
        certifications: true,
      },
    })

    if (updatedProfile) {
      const completion = calculateProfileCompletion(updatedProfile)
      await prisma.applicantProfile.update({
        where: { userId },
        data: { profileCompleteness: completion.percentage },
      })
    }

    revalidatePath('/applicant/profile')
    revalidatePath('/applicant/dashboard')

    await createAuditLog({
      actorUserId: userId,
      action: 'profile.education.created',
      targetType: 'Education',
    })

    return { success: true }
  } catch (error) {
    reportError(error, {
      scope: 'education.create',
      userId,
    })
    return { success: false, error: 'Failed to create education entry' }
  }
}

/**
 * Update an existing education entry
 */
export async function updateEducation(id: string, formData: FormData) {
  const user = await requireCurrentUser({
    roles: ['APPLICANT'],
    permission: 'MANAGE_SELF_PROFILE',
  })
  const userId = user.id

  const rawData = {
    institution: formData.get('institution') as string,
    degree: formData.get('degree') as string,
    fieldOfStudy: formData.get('fieldOfStudy') as string,
    startDate: formData.get('startDate')
      ? new Date(formData.get('startDate') as string)
      : null,
    endDate: formData.get('endDate')
      ? new Date(formData.get('endDate') as string)
      : null,
    description: formData.get('description') as string,
  }

  const result = educationSchema.safeParse(rawData)

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0]?.message || 'Invalid data',
    }
  }

  try {
    // Verify ownership
    const education = await prisma.education.findUnique({
      where: { id },
      include: { applicantProfile: true },
    })

    if (!education || education.applicantProfile.userId !== userId) {
      return { success: false, error: 'Education entry not found' }
    }

    await prisma.education.update({
      where: { id },
      data: result.data,
    })

    revalidatePath('/applicant/profile')

    await createActivityLog({
      actorUserId: userId,
      description: 'Updated education history',
    })

    return { success: true }
  } catch (error) {
    reportError(error, {
      scope: 'education.update',
      userId,
      metadata: { educationId: id },
    })
    return { success: false, error: 'Failed to update education entry' }
  }
}

/**
 * Delete an education entry
 */
export async function deleteEducation(id: string) {
  const user = await requireCurrentUser({
    roles: ['APPLICANT'],
    permission: 'MANAGE_SELF_PROFILE',
  })
  const userId = user.id

  try {
    // Verify ownership
    const education = await prisma.education.findUnique({
      where: { id },
      include: { applicantProfile: true },
    })

    if (!education || education.applicantProfile.userId !== userId) {
      return { success: false, error: 'Education entry not found' }
    }

    await prisma.education.delete({ where: { id } })

    // Update profile completion
    const updatedProfile = await prisma.applicantProfile.findUnique({
      where: { userId },
      include: {
        workExperiences: true,
        educations: true,
        certifications: true,
      },
    })

    if (updatedProfile) {
      const completion = calculateProfileCompletion(updatedProfile)
      await prisma.applicantProfile.update({
        where: { userId },
        data: { profileCompleteness: completion.percentage },
      })
    }

    revalidatePath('/applicant/profile')
    revalidatePath('/applicant/dashboard')

    await createAuditLog({
      actorUserId: userId,
      action: 'profile.education.deleted',
      targetType: 'Education',
      targetId: id,
    })

    return { success: true }
  } catch (error) {
    reportError(error, {
      scope: 'education.delete',
      userId,
      metadata: { educationId: id },
    })
    return { success: false, error: 'Failed to delete education entry' }
  }
}
