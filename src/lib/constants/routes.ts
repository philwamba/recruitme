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
        // Master Data routes
        MASTER_DATA: {
            ROOT: '/admin/master-data',
            JOB_CATEGORIES: '/admin/master-data/job-categories',
            JOB_TITLES: '/admin/master-data/job-titles',
            RANK_GRADES: '/admin/master-data/rank-grades',
            QUALITIES: '/admin/master-data/qualities',
            QUESTIONNAIRES: '/admin/master-data/questionnaires',
            POLICIES: '/admin/master-data/policies',
        },
        // Configuration routes
        CONFIG: {
            ROOT: '/admin/config',
            JOB_TEMPLATES: '/admin/config/job-templates',
            JOB_FAMILIES: '/admin/config/job-families',
            INTERVIEW_TEMPLATES: '/admin/config/interview-templates',
            OFFER_TEMPLATES: '/admin/config/offer-templates',
            ORGANIZATION: '/admin/config/organization',
            WORKFLOW: '/admin/config/workflow',
        },
        // Job Request routes
        JOB_REQUESTS: '/admin/job-requests',
    },
} as const

export type ApplicantRoute = (typeof ROUTES.APPLICANT)[keyof typeof ROUTES.APPLICANT]
