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
        NOTIFICATIONS: '/employer/notifications',
        SETTINGS: '/employer/settings',
    },

    // Admin routes
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        JOBS: '/admin/jobs',
        CANDIDATES: '/admin/candidates',
        PIPELINE: '/admin/pipeline',
        INTERVIEWS: '/admin/interviews',
        ASSESSMENTS: '/admin/assessments',
        USERS: '/admin/users',
        ANALYTICS: '/admin/analytics',
        TEMPLATES: '/admin/templates',
        COMPLIANCE: '/admin/compliance',
        OPERATIONS: {
            ROOT: '/admin/operations',
            AUDIT_LOGS: '/admin/operations/audit-logs',
            ACTIVITY_LOGS: '/admin/operations/activity-logs',
            DELIVERY_LOGS: '/admin/operations/delivery-logs',
        },
        SETTINGS: '/admin/settings',
    },
} as const

export type ApplicantRoute = (typeof ROUTES.APPLICANT)[keyof typeof ROUTES.APPLICANT]
