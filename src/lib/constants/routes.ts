export const ROUTES = {
  // Public routes
  HOME: '/',
  JOBS: '/jobs',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',

  // Applicant routes
  APPLICANT: {
    DASHBOARD: '/applicant/dashboard',
    PROFILE: '/applicant/profile',
    UPLOAD_CV: '/applicant/upload-cv',
    APPLICATIONS: '/applicant/applications',
    SETTINGS: '/applicant/settings',
  },

  // Employer routes
  EMPLOYER: {
    DASHBOARD: '/employer/dashboard',
    JOBS: '/employer/jobs',
    CANDIDATES: '/employer/candidates',
  },

  // Admin routes (future)
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
  },
} as const

export type ApplicantRoute = (typeof ROUTES.APPLICANT)[keyof typeof ROUTES.APPLICANT]
