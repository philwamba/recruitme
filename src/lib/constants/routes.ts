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
        ASSESSMENTS: '/applicant/assessments',
        NOTIFICATIONS: '/applicant/notifications',
        COMPLIANCE: '/applicant/compliance',
        SETTINGS: '/applicant/settings',
    },

    // Employer routes
    EMPLOYER: {
        DASHBOARD: '/employer/dashboard',
        JOBS: '/employer/jobs',
        CANDIDATES: '/employer/candidates',
        INTERVIEWS: '/employer/interviews',
        ASSESSMENTS: '/employer/assessments',
    },

    // Admin routes
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        USERS: '/admin/users',
        ANALYTICS: '/admin/analytics',
        TEMPLATES: '/admin/templates',
        COMPLIANCE: '/admin/compliance',
        OPERATIONS: '/admin/operations',
    },
} as const

export type ApplicantRoute = (typeof ROUTES.APPLICANT)[keyof typeof ROUTES.APPLICANT]
