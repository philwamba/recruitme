'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Menu, Search, ChevronRight, Home } from 'lucide-react'
import type { AuthenticatedUser } from '@/lib/auth'
import { signOut } from '@/app/auth/actions'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface EmployerHeaderProps {
    user: AuthenticatedUser
    onMenuClick?: () => void
}

const breadcrumbLabels: Record<string, string> = {
    employer: 'Employer',
    dashboard: 'Dashboard',
    jobs: 'Jobs',
    candidates: 'Candidates',
    interviews: 'Interviews',
    assessments: 'Assessments',
    notifications: 'Notifications',
    settings: 'Settings',
    new: 'Create New',
    edit: 'Edit',
}

export function EmployerHeader({ user, onMenuClick }: EmployerHeaderProps) {
    const pathname = usePathname()
    const initials = user.email.slice(0, 2).toUpperCase()

    // Generate breadcrumbs from pathname
    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs = pathSegments.map((segment, index) => {
        const href = '/' + pathSegments.slice(0, index + 1).join('/')
        const isLast = index === pathSegments.length - 1
        // Check if segment is a dynamic ID (UUID or numeric)
        const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) ||
                     /^\d+$/.test(segment)
        const label = isId ? 'Details' : (breadcrumbLabels[segment] || segment)

        return { href, label, isLast, segment }
    })

    // Skip 'employer' from breadcrumbs display (it's redundant)
    const displayBreadcrumbs = breadcrumbs.slice(1)

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            {/* Mobile menu button */}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={onMenuClick}
                aria-label="Toggle menu"
            >
                <Menu className="h-5 w-5" />
            </Button>

            {/* Breadcrumbs */}
            <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={ROUTES.EMPLOYER.DASHBOARD} className="flex items-center gap-1">
                                <Home className="h-4 w-4" />
                                <span className="sr-only">Employer Home</span>
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {displayBreadcrumbs.map((crumb, index) => (
                        <React.Fragment key={crumb.href}>
                            <BreadcrumbSeparator>
                                <ChevronRight className="h-4 w-4" />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                {crumb.isLast ? (
                                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={crumb.href}>{crumb.label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>

            {/* Mobile breadcrumb - just show current page */}
            <div className="flex-1 md:hidden">
                <span className="text-sm font-medium">
                    {displayBreadcrumbs[displayBreadcrumbs.length - 1]?.label || 'Dashboard'}
                </span>
            </div>

            {/* Search - desktop only */}
            <div className="hidden flex-1 md:flex md:justify-center">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search candidates, applications..."
                        className="pl-9"
                        disabled
                    />
                </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
                {/* Notifications */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Notifications"
                    asChild
                >
                    <Link href={ROUTES.EMPLOYER.NOTIFICATIONS}>
                        <Bell className="h-5 w-5" />
                    </Link>
                </Button>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src="" alt={user.email} />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.email}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.role}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={ROUTES.EMPLOYER.SETTINGS}>Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="text-destructive focus:text-destructive">
                            <form action={signOut} className="w-full">
                                <button type="submit" className="w-full text-left">
                                    Sign out
                                </button>
                            </form>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
