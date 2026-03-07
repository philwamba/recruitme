import {
    LayoutDashboard,
    Briefcase,
    Users,
    Calendar,
    ClipboardCheck,
    Bell,
    Settings,
    Building2,
    MapPin,
    FolderKanban,
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
        title: 'Configuration',
        items: [
            {
                title: 'Departments',
                href: ROUTES.EMPLOYER.CONFIG.DEPARTMENTS,
                icon: FolderKanban,
                matchPaths: ['/employer/settings/departments'],
            },
            {
                title: 'Companies',
                href: ROUTES.EMPLOYER.CONFIG.COMPANIES,
                icon: Building2,
                matchPaths: ['/employer/settings/companies'],
            },
            {
                title: 'Locations',
                href: ROUTES.EMPLOYER.CONFIG.LOCATIONS,
                icon: MapPin,
                matchPaths: ['/employer/settings/locations'],
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
