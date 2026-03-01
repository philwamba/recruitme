'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import { experienceSchema } from '@/lib/validations/experience'
import {
  calculateProfileCompletion,
  calculateTotalYearsExperience,
} from '@/lib/services/profile-completion'
import { createActivityLog, createAuditLog } from '@/lib/observability/audit'
import { reportError } from '@/lib/observability/error-reporting'

/**
 * Create a new work experience entry
 */
export async function createWorkExperience(formData: FormData) {
  const user = await requireCurrentUser({
    roles: ['APPLICANT'],
    permission: 'MANAGE_SELF_PROFILE',
  })
  const userId = user.id

  const rawData = {
    company: formData.get('company') as string,
    role: formData.get('role') as string,
    location: formData.get('location') as string,
    startDate: new Date(formData.get('startDate') as string),
    endDate: formData.get('endDate')
      ? new Date(formData.get('endDate') as string)
      : null,
    isCurrent: formData.get('isCurrent') === 'true',
    description: formData.get('description') as string,
  }

  const result = experienceSchema.safeParse(rawData)

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

    await prisma.workExperience.create({
      data: {
        applicantProfileId: profile.id,
        ...result.data,
      },
    })

    // Update profile completion and total years
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
      const totalYears = calculateTotalYearsExperience(updatedProfile.workExperiences)

      await prisma.applicantProfile.update({
        where: { userId },
        data: {
          profileCompleteness: completion.percentage,
          totalYearsExperience: totalYears,
        },
      })
    }

    revalidatePath('/applicant/profile')
    revalidatePath('/applicant/dashboard')

    await createActivityLog({
      actorUserId: userId,
      description: 'Added work experience',
    })

    return { success: true }
  } catch (error) {
    reportError(error, {
      scope: 'work-experience.create',
      userId,
    })
    return { success: false, error: 'Failed to create work experience' }
  }
}

/**
 * Update an existing work experience entry
 */
export async function updateWorkExperience(id: string, formData: FormData) {
  const user = await requireCurrentUser({
    roles: ['APPLICANT'],
    permission: 'MANAGE_SELF_PROFILE',
  })
  const userId = user.id

  const rawData = {
    company: formData.get('company') as string,
    role: formData.get('role') as string,
    location: formData.get('location') as string,
    startDate: new Date(formData.get('startDate') as string),
    endDate: formData.get('endDate')
      ? new Date(formData.get('endDate') as string)
      : null,
    isCurrent: formData.get('isCurrent') === 'true',
    description: formData.get('description') as string,
  }

  const result = experienceSchema.safeParse(rawData)

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0]?.message || 'Invalid data',
    }
  }

  try {
    // Verify ownership
    const experience = await prisma.workExperience.findUnique({
      where: { id },
      include: { applicantProfile: true },
    })

    if (!experience || experience.applicantProfile.userId !== userId) {
      return { success: false, error: 'Work experience not found' }
    }

    await prisma.workExperience.update({
      where: { id },
      data: result.data,
    })

    // Update total years
    const updatedProfile = await prisma.applicantProfile.findUnique({
      where: { userId },
      include: { workExperiences: true },
    })

    if (updatedProfile) {
      const totalYears = calculateTotalYearsExperience(updatedProfile.workExperiences)
      await prisma.applicantProfile.update({
        where: { userId },
        data: { totalYearsExperience: totalYears },
      })
    }

    revalidatePath('/applicant/profile')

    await createActivityLog({
      actorUserId: userId,
      description: 'Updated work experience',
    })

    return { success: true }
  } catch (error) {
    reportError(error, {
      scope: 'work-experience.update',
      userId,
      metadata: { experienceId: id },
    })
    return { success: false, error: 'Failed to update work experience' }
  }
}

/**
 * Delete a work experience entry
 */
export async function deleteWorkExperience(id: string) {
  const user = await requireCurrentUser({
    roles: ['APPLICANT'],
    permission: 'MANAGE_SELF_PROFILE',
  })
  const userId = user.id

  try {
    // Verify ownership
    const experience = await prisma.workExperience.findUnique({
      where: { id },
      include: { applicantProfile: true },
    })

    if (!experience || experience.applicantProfile.userId !== userId) {
      return { success: false, error: 'Work experience not found' }
    }

    await prisma.workExperience.delete({ where: { id } })

    // Update profile completion and total years
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
      const totalYears = calculateTotalYearsExperience(updatedProfile.workExperiences)

      await prisma.applicantProfile.update({
        where: { userId },
        data: {
          profileCompleteness: completion.percentage,
          totalYearsExperience: totalYears,
        },
      })
    }

    revalidatePath('/applicant/profile')
    revalidatePath('/applicant/dashboard')

    await createAuditLog({
      actorUserId: userId,
      action: 'profile.work-experience.deleted',
      targetType: 'WorkExperience',
      targetId: id,
    })

    return { success: true }
  } catch (error) {
    reportError(error, {
      scope: 'work-experience.delete',
      userId,
      metadata: { experienceId: id },
    })
    return { success: false, error: 'Failed to delete work experience' }
  }
}
