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
  Department,
  JobPipelineStage,
  ApplicationStageEvent,
  ApplicationNote,
  Tag,
  ApplicationTag,
  ApplicationRating,
  CandidateDocument,
  EmploymentType,
  WorkplaceType,
  JobStatus,
  DocumentType,
} from '@prisma/client'

// Re-export Prisma types
export type {
  User,
  ApplicantProfile,
  WorkExperience,
  Education,
  Certification,
  Application,
  Job,
  Department,
  JobPipelineStage,
  ApplicationStageEvent,
  ApplicationNote,
  Tag,
  ApplicationTag,
  ApplicationRating,
  CandidateDocument,
}
export {
  ApplicationStatus,
  UserRole,
  EmploymentType,
  WorkplaceType,
  JobStatus,
  DocumentType,
}

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

export type PublicJob = Job & {
  department: Department | null
}

export type ApplicationWithRelations = Application & {
  job: PublicJob
  currentStage: JobPipelineStage | null
  notes: ApplicationNote[]
  stageEvents: ApplicationStageEvent[]
  tags: (ApplicationTag & { tag: Tag })[]
  ratings: ApplicationRating[]
  documents: CandidateDocument[]
}

// Dashboard stats
export interface DashboardStats {
  totalApplications: number
  submittedApplications: number
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
