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
    type LucideIcon,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'

export interface NavItem {
    title: string
    href: string
    icon: LucideIcon
    badge?: string
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
                matchPaths: ['/admin/candidates'],
            },
            {
                title: 'Pipeline',
                href: ROUTES.ADMIN.PIPELINE,
                icon: Columns3,
                matchPaths: ['/admin/pipeline'],
            },
            {
                title: 'Interviews',
                href: ROUTES.ADMIN.INTERVIEWS,
                icon: Calendar,
                matchPaths: ['/admin/interviews'],
            },
            {
                title: 'Assessments',
                href: ROUTES.ADMIN.ASSESSMENTS,
                icon: ClipboardCheck,
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
