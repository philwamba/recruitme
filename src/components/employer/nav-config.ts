import {
    LayoutDashboard,
    Briefcase,
    Users,
    Calendar,
    ClipboardCheck,
    Bell,
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

export const employerNavGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            {
                title: 'Dashboard',
                href: ROUTES.EMPLOYER.DASHBOARD,
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: 'Recruitment',
        items: [
            {
                title: 'Jobs',
                href: ROUTES.EMPLOYER.JOBS,
                icon: Briefcase,
                matchPaths: ['/employer/jobs'],
            },
            {
                title: 'Candidates',
                href: ROUTES.EMPLOYER.CANDIDATES,
                icon: Users,
                matchPaths: ['/employer/candidates'],
            },
            {
                title: 'Interviews',
                href: ROUTES.EMPLOYER.INTERVIEWS,
                icon: Calendar,
                matchPaths: ['/employer/interviews'],
            },
            {
                title: 'Assessments',
                href: ROUTES.EMPLOYER.ASSESSMENTS,
                icon: ClipboardCheck,
                matchPaths: ['/employer/assessments'],
            },
        ],
    },
    {
        title: 'Account',
        items: [
            {
                title: 'Notifications',
                href: ROUTES.EMPLOYER.NOTIFICATIONS,
                icon: Bell,
            },
            {
                title: 'Settings',
                href: ROUTES.EMPLOYER.SETTINGS,
                icon: Settings,
            },
        ],
    },
]
