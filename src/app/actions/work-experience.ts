'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getMockUserId } from '@/lib/auth'
import { experienceSchema } from '@/lib/validations/experience'
import {
  calculateProfileCompletion,
  calculateTotalYearsExperience,
} from '@/lib/services/profile-completion'

/**
 * Create a new work experience entry
 */
export async function createWorkExperience(formData: FormData) {
  const userId = getMockUserId()

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

    return { success: true }
  } catch (error) {
    console.error('Error creating work experience:', error)
    return { success: false, error: 'Failed to create work experience' }
  }
}

/**
 * Update an existing work experience entry
 */
export async function updateWorkExperience(id: string, formData: FormData) {
  const userId = getMockUserId()

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

    return { success: true }
  } catch (error) {
    console.error('Error updating work experience:', error)
    return { success: false, error: 'Failed to update work experience' }
  }
}

/**
 * Delete a work experience entry
 */
export async function deleteWorkExperience(id: string) {
  const userId = getMockUserId()

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

    return { success: true }
  } catch (error) {
    console.error('Error deleting work experience:', error)
    return { success: false, error: 'Failed to delete work experience' }
  }
}
