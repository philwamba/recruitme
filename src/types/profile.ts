import type {
  User,
  ApplicantProfile,
  WorkExperience,
  Education,
  Certification,
  Application,
  Job,
  ApplicationStatus,
  UserRole,
} from '@prisma/client'

// Re-export Prisma types
export type { User, ApplicantProfile, WorkExperience, Education, Certification, Application, Job }
export { ApplicationStatus, UserRole }

// Extended profile with relations
export type ApplicantProfileWithRelations = ApplicantProfile & {
  workExperiences: WorkExperience[]
  educations: Education[]
  certifications: Certification[]
}

// User with profile
export type UserWithProfile = User & {
  applicantProfile: ApplicantProfileWithRelations | null
}

// Application with job details
export type ApplicationWithJob = Application & {
  job: Job
}

// Dashboard stats
export interface DashboardStats {
  totalApplications: number
  pendingApplications: number
  reviewingApplications: number
  shortlistedApplications: number
  rejectedApplications: number
  hiredApplications: number
}

// Profile completion details
export interface ProfileCompletionDetails {
  percentage: number
  sections: {
    name: string
    completed: boolean
    weight: number
  }[]
  missingFields: string[]
}
