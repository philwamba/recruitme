import {
    LayoutDashboard,
    Briefcase,
    Users,
    Columns3,
    Calendar,
    ClipboardCheck,
    UserCog,
    BarChart3,
    Mail,
    Shield,
    Activity,
    Settings,
    Database,
    FolderTree,
    FileText,
    Star,
    HelpCircle,
    ScrollText,
    Cog,
    GitBranch,
    Building2,
    FileCheck,
    type LucideIcon,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'

export interface NavItem {
    title: string
    href: string
    icon: LucideIcon
    badge?: string
    badgeKey?: 'candidates' | 'interviews' | 'assessments' | 'pendingReviews'
    matchPaths?: string[]
}

export interface NavGroup {
    title: string
    items: NavItem[]
}

export const adminNavGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            {
                title: 'Dashboard',
                href: ROUTES.ADMIN.DASHBOARD,
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: 'Recruitment',
        items: [
            {
                title: 'Jobs',
                href: ROUTES.ADMIN.JOBS,
                icon: Briefcase,
                matchPaths: ['/admin/jobs'],
            },
            {
                title: 'Candidates',
                href: ROUTES.ADMIN.CANDIDATES,
                icon: Users,
                badgeKey: 'candidates',
                matchPaths: ['/admin/candidates'],
            },
            {
                title: 'Pipeline',
                href: ROUTES.ADMIN.PIPELINE,
                icon: Columns3,
                badgeKey: 'pendingReviews',
                matchPaths: ['/admin/pipeline'],
            },
            {
                title: 'Interviews',
                href: ROUTES.ADMIN.INTERVIEWS,
                icon: Calendar,
                badgeKey: 'interviews',
                matchPaths: ['/admin/interviews'],
            },
            {
                title: 'Assessments',
                href: ROUTES.ADMIN.ASSESSMENTS,
                icon: ClipboardCheck,
                badgeKey: 'assessments',
                matchPaths: ['/admin/assessments'],
            },
        ],
    },
    {
        title: 'Communications',
        items: [
            {
                title: 'Templates',
                href: ROUTES.ADMIN.TEMPLATES,
                icon: Mail,
            },
        ],
    },
    {
        title: 'Management',
        items: [
            {
                title: 'Users',
                href: ROUTES.ADMIN.USERS,
                icon: UserCog,
            },
            {
                title: 'Analytics',
                href: ROUTES.ADMIN.ANALYTICS,
                icon: BarChart3,
            },
        ],
    },
    {
        title: 'Master Data',
        items: [
            {
                title: 'Job Categories',
                href: ROUTES.ADMIN.MASTER_DATA.JOB_CATEGORIES,
                icon: FolderTree,
                matchPaths: ['/admin/master-data/job-categories'],
            },
            {
                title: 'Job Titles',
                href: ROUTES.ADMIN.MASTER_DATA.JOB_TITLES,
                icon: FileText,
                matchPaths: ['/admin/master-data/job-titles'],
            },
            {
                title: 'Rank Grades',
                href: ROUTES.ADMIN.MASTER_DATA.RANK_GRADES,
                icon: Star,
                matchPaths: ['/admin/master-data/rank-grades'],
            },
            {
                title: 'Qualities',
                href: ROUTES.ADMIN.MASTER_DATA.QUALITIES,
                icon: Database,
                matchPaths: ['/admin/master-data/qualities'],
            },
            {
                title: 'Questionnaires',
                href: ROUTES.ADMIN.MASTER_DATA.QUESTIONNAIRES,
                icon: HelpCircle,
                matchPaths: ['/admin/master-data/questionnaires'],
            },
            {
                title: 'Policies',
                href: ROUTES.ADMIN.MASTER_DATA.POLICIES,
                icon: ScrollText,
                matchPaths: ['/admin/master-data/policies'],
            },
        ],
    },
    {
        title: 'Configuration',
        items: [
            {
                title: 'Job Templates',
                href: ROUTES.ADMIN.CONFIG.JOB_TEMPLATES,
                icon: Briefcase,
                matchPaths: ['/admin/config/job-templates'],
            },
            {
                title: 'Job Families',
                href: ROUTES.ADMIN.CONFIG.JOB_FAMILIES,
                icon: GitBranch,
                matchPaths: ['/admin/config/job-families'],
            },
            {
                title: 'Interview Templates',
                href: ROUTES.ADMIN.CONFIG.INTERVIEW_TEMPLATES,
                icon: Calendar,
                matchPaths: ['/admin/config/interview-templates'],
            },
            {
                title: 'Offer Templates',
                href: ROUTES.ADMIN.CONFIG.OFFER_TEMPLATES,
                icon: FileCheck,
                matchPaths: ['/admin/config/offer-templates'],
            },
            {
                title: 'Organization',
                href: ROUTES.ADMIN.CONFIG.ORGANIZATION,
                icon: Building2,
                matchPaths: ['/admin/config/organization'],
            },
            {
                title: 'Workflow',
                href: ROUTES.ADMIN.CONFIG.WORKFLOW,
                icon: Cog,
                matchPaths: ['/admin/config/workflow'],
            },
        ],
    },
    {
        title: 'System',
        items: [
            {
                title: 'Compliance',
                href: ROUTES.ADMIN.COMPLIANCE,
                icon: Shield,
            },
            {
                title: 'Operations',
                href: ROUTES.ADMIN.OPERATIONS.ROOT,
                icon: Activity,
                matchPaths: ['/admin/operations'],
            },
            {
                title: 'Settings',
                href: ROUTES.ADMIN.SETTINGS,
                icon: Settings,
            },
        ],
    },
]
