import type { ApplicantProfileWithRelations, ProfileCompletionDetails } from '@/types/profile'

interface Section {
  name: string
  weight: number
  check: (profile: ApplicantProfileWithRelations) => boolean
}

const PROFILE_SECTIONS: Section[] = [
  {
    name: 'Basic Information',
    weight: 15,
    check: (profile) =>
      !!(profile.firstName && profile.lastName),
  },
  {
    name: 'Contact Details',
    weight: 10,
    check: (profile) => !!(profile.phone || profile.city),
  },
  {
    name: 'Professional Links',
    weight: 10,
    check: (profile) =>
      !!(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl),
  },
  {
    name: 'Professional Summary',
    weight: 15,
    check: (profile) => !!(profile.headline && profile.bio),
  },
  {
    name: 'Skills',
    weight: 15,
    check: (profile) => profile.skills.length >= 3,
  },
  {
    name: 'Work Experience',
    weight: 20,
    check: (profile) => profile.workExperiences.length > 0,
  },
  {
    name: 'Education',
    weight: 10,
    check: (profile) => profile.educations.length > 0,
  },
  {
    name: 'CV Upload',
    weight: 5,
    check: (profile) => !!profile.cvUrl,
  },
]

/**
 * Calculate profile completion percentage and details
 */
export function calculateProfileCompletion(
  profile: ApplicantProfileWithRelations
): ProfileCompletionDetails {
  const sections = PROFILE_SECTIONS.map((section) => ({
    name: section.name,
    completed: section.check(profile),
    weight: section.weight,
  }))

  const percentage = sections.reduce(
    (total, section) => total + (section.completed ? section.weight : 0),
    0
  )

  const missingFields = sections
    .filter((section) => !section.completed)
    .map((section) => section.name)

  return {
    percentage,
    sections,
    missingFields,
  }
}

/**
 * Calculate total years of experience from work history
 */
export function calculateTotalYearsExperience(
  workExperiences: { startDate: Date; endDate: Date | null; isCurrent: boolean }[]
): number {
  if (workExperiences.length === 0) return 0

  let totalMonths = 0
  const now = new Date()

  for (const exp of workExperiences) {
    const startDate = new Date(exp.startDate)
    const endDate = exp.isCurrent || !exp.endDate ? now : new Date(exp.endDate)

    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth())

    totalMonths += Math.max(0, months)
  }

  // Round to 1 decimal place
  return Math.round((totalMonths / 12) * 10) / 10
}

/**
 * Get completion percentage only (for quick display)
 */
export function getCompletionPercentage(
  profile: ApplicantProfileWithRelations
): number {
  return calculateProfileCompletion(profile).percentage
}
