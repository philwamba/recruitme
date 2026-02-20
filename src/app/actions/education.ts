'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getMockUserId } from '@/lib/auth'
import { educationSchema } from '@/lib/validations/education'
import { calculateProfileCompletion } from '@/lib/services/profile-completion'

/**
 * Create a new education entry
 */
export async function createEducation(formData: FormData) {
  const userId = getMockUserId()

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

    return { success: true }
  } catch (error) {
    console.error('Error creating education:', error)
    return { success: false, error: 'Failed to create education entry' }
  }
}

/**
 * Update an existing education entry
 */
export async function updateEducation(id: string, formData: FormData) {
  const userId = getMockUserId()

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

    return { success: true }
  } catch (error) {
    console.error('Error updating education:', error)
    return { success: false, error: 'Failed to update education entry' }
  }
}

/**
 * Delete an education entry
 */
export async function deleteEducation(id: string) {
  const userId = getMockUserId()

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

    return { success: true }
  } catch (error) {
    console.error('Error deleting education:', error)
    return { success: false, error: 'Failed to delete education entry' }
  }
}
