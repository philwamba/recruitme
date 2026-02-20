'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getMockUserId } from '@/lib/auth'
import { certificationSchema } from '@/lib/validations/certification'
import { calculateProfileCompletion } from '@/lib/services/profile-completion'

/**
 * Create a new certification entry
 */
export async function createCertification(formData: FormData) {
  const userId = getMockUserId()

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

    return { success: true }
  } catch (error) {
    console.error('Error creating certification:', error)
    return { success: false, error: 'Failed to create certification' }
  }
}

/**
 * Update an existing certification entry
 */
export async function updateCertification(id: string, formData: FormData) {
  const userId = getMockUserId()

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

    return { success: true }
  } catch (error) {
    console.error('Error updating certification:', error)
    return { success: false, error: 'Failed to update certification' }
  }
}

/**
 * Delete a certification entry
 */
export async function deleteCertification(id: string) {
  const userId = getMockUserId()

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

    return { success: true }
  } catch (error) {
    console.error('Error deleting certification:', error)
    return { success: false, error: 'Failed to delete certification' }
  }
}
