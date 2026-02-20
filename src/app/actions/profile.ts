'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getMockUserId, MOCK_USER_ID } from '@/lib/auth'
import {
  personalInfoSchema,
  linksSchema,
  summarySchema,
} from '@/lib/validations/profile'
import {
  calculateProfileCompletion,
  calculateTotalYearsExperience,
} from '@/lib/services/profile-completion'
import type { ApplicantProfileWithRelations } from '@/types/profile'

/**
 * Get or create the applicant profile for the current user
 */
export async function getOrCreateProfile(): Promise<ApplicantProfileWithRelations | null> {
  const userId = getMockUserId()

  try {
    // First, ensure user exists
    let user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      // Create mock user for development
      user = await prisma.user.create({
        data: {
          id: MOCK_USER_ID,
          email: 'demo@recruitme.com',
          role: 'APPLICANT',
        },
      })
    }

    // Get or create profile
    let profile = await prisma.applicantProfile.findUnique({
      where: { userId },
      include: {
        workExperiences: { orderBy: { startDate: 'desc' } },
        educations: { orderBy: { endDate: 'desc' } },
        certifications: { orderBy: { issueDate: 'desc' } },
      },
    })

    if (!profile) {
      profile = await prisma.applicantProfile.create({
        data: {
          userId,
          firstName: 'Demo',
          lastName: 'User',
        },
        include: {
          workExperiences: { orderBy: { startDate: 'desc' } },
          educations: { orderBy: { endDate: 'desc' } },
          certifications: { orderBy: { issueDate: 'desc' } },
        },
      })
    }

    return profile
  } catch (error) {
    console.error('Error getting/creating profile:', error)
    return null
  }
}

/**
 * Update personal information
 */
export async function updatePersonalInfo(formData: FormData) {
  const userId = getMockUserId()

  const rawData = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    phone: formData.get('phone') as string,
    city: formData.get('city') as string,
    country: formData.get('country') as string,
  }

  const result = personalInfoSchema.safeParse(rawData)

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0]?.message || 'Invalid data',
    }
  }

  try {
    const profile = await prisma.applicantProfile.update({
      where: { userId },
      data: {
        ...result.data,
        updatedAt: new Date(),
      },
      include: {
        workExperiences: true,
        educations: true,
        certifications: true,
      },
    })

    // Update profile completion
    const completion = calculateProfileCompletion(profile)
    await prisma.applicantProfile.update({
      where: { userId },
      data: { profileCompleteness: completion.percentage },
    })

    revalidatePath('/applicant/profile')
    revalidatePath('/applicant/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error updating personal info:', error)
    return { success: false, error: 'Failed to update personal information' }
  }
}

/**
 * Update profile links
 */
export async function updateLinks(formData: FormData) {
  const userId = getMockUserId()

  const rawData = {
    linkedinUrl: formData.get('linkedinUrl') as string,
    githubUrl: formData.get('githubUrl') as string,
    portfolioUrl: formData.get('portfolioUrl') as string,
  }

  const result = linksSchema.safeParse(rawData)

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0]?.message || 'Invalid data',
    }
  }

  try {
    const profile = await prisma.applicantProfile.update({
      where: { userId },
      data: {
        ...result.data,
        updatedAt: new Date(),
      },
      include: {
        workExperiences: true,
        educations: true,
        certifications: true,
      },
    })

    // Update profile completion
    const completion = calculateProfileCompletion(profile)
    await prisma.applicantProfile.update({
      where: { userId },
      data: { profileCompleteness: completion.percentage },
    })

    revalidatePath('/applicant/profile')

    return { success: true }
  } catch (error) {
    console.error('Error updating links:', error)
    return { success: false, error: 'Failed to update links' }
  }
}

/**
 * Update professional summary
 */
export async function updateSummary(formData: FormData) {
  const userId = getMockUserId()

  const rawData = {
    headline: formData.get('headline') as string,
    bio: formData.get('bio') as string,
  }

  const result = summarySchema.safeParse(rawData)

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0]?.message || 'Invalid data',
    }
  }

  try {
    const profile = await prisma.applicantProfile.update({
      where: { userId },
      data: {
        ...result.data,
        updatedAt: new Date(),
      },
      include: {
        workExperiences: true,
        educations: true,
        certifications: true,
      },
    })

    // Update profile completion
    const completion = calculateProfileCompletion(profile)
    await prisma.applicantProfile.update({
      where: { userId },
      data: { profileCompleteness: completion.percentage },
    })

    revalidatePath('/applicant/profile')

    return { success: true }
  } catch (error) {
    console.error('Error updating summary:', error)
    return { success: false, error: 'Failed to update summary' }
  }
}

/**
 * Update skills
 */
export async function updateSkills(skills: string[]) {
  const userId = getMockUserId()

  if (skills.length > 50) {
    return { success: false, error: 'Maximum 50 skills allowed' }
  }

  try {
    const profile = await prisma.applicantProfile.update({
      where: { userId },
      data: {
        skills,
        updatedAt: new Date(),
      },
      include: {
        workExperiences: true,
        educations: true,
        certifications: true,
      },
    })

    // Update profile completion
    const completion = calculateProfileCompletion(profile)
    await prisma.applicantProfile.update({
      where: { userId },
      data: { profileCompleteness: completion.percentage },
    })

    revalidatePath('/applicant/profile')

    return { success: true }
  } catch (error) {
    console.error('Error updating skills:', error)
    return { success: false, error: 'Failed to update skills' }
  }
}

/**
 * Get dashboard stats for the current user
 */
export async function getDashboardStats() {
  const userId = getMockUserId()

  try {
    const [
      profile,
      totalApplications,
      pendingCount,
      reviewingCount,
      shortlistedCount,
      rejectedCount,
      hiredCount,
      recentApplications,
    ] = await Promise.all([
      prisma.applicantProfile.findUnique({
        where: { userId },
        include: {
          workExperiences: true,
          educations: true,
          certifications: true,
        },
      }),
      prisma.application.count({ where: { userId } }),
      prisma.application.count({ where: { userId, status: 'PENDING' } }),
      prisma.application.count({ where: { userId, status: 'REVIEWING' } }),
      prisma.application.count({ where: { userId, status: 'SHORTLISTED' } }),
      prisma.application.count({ where: { userId, status: 'REJECTED' } }),
      prisma.application.count({ where: { userId, status: 'HIRED' } }),
      prisma.application.findMany({
        where: { userId },
        include: { job: true },
        orderBy: { appliedAt: 'desc' },
        take: 3,
      }),
    ])

    return {
      profile,
      stats: {
        totalApplications,
        pendingApplications: pendingCount,
        reviewingApplications: reviewingCount,
        shortlistedApplications: shortlistedCount,
        rejectedApplications: rejectedCount,
        hiredApplications: hiredCount,
      },
      recentApplications,
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return null
  }
}
