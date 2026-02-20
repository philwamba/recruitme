// Parsed CV data structure
export interface ParsedCVData {
  personalInfo: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    city?: string
    country?: string
    linkedinUrl?: string
    githubUrl?: string
    portfolioUrl?: string
  }
  summary?: {
    headline?: string
    bio?: string
  }
  workExperiences: Array<{
    company: string
    role: string
    location?: string
    startDate: string
    endDate?: string
    isCurrent?: boolean
    description?: string
  }>
  educations: Array<{
    institution: string
    degree: string
    fieldOfStudy?: string
    startDate?: string
    endDate?: string
    description?: string
  }>
  certifications: Array<{
    name: string
    issuingOrg?: string
    issueDate?: string
    expirationDate?: string
    credentialUrl?: string
  }>
  skills: string[]
}

// CV upload result
export interface CVUploadResult {
  url: string
  fileName: string
  key: string
}

// CV parsing status
export type CVParsingStatus = 'idle' | 'uploading' | 'parsing' | 'reviewing' | 'saving' | 'complete' | 'error'

// CV parser response
export interface CVParserResponse {
  success: boolean
  data?: ParsedCVData
  error?: string
}
