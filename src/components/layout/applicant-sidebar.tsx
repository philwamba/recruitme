'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  Settings,
  LogOut,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/lib/constants/routes'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: string
}

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: ROUTES.APPLICANT.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: 'My Profile',
    href: ROUTES.APPLICANT.PROFILE,
    icon: User,
  },
  {
    title: 'Upload CV',
    href: ROUTES.APPLICANT.UPLOAD_CV,
    icon: FileText,
  },
  {
    title: 'Applications',
    href: ROUTES.APPLICANT.APPLICATIONS,
    icon: Briefcase,
    badge: 'Soon',
  },
]

const secondaryNavItems: NavItem[] = [
  {
    title: 'Settings',
    href: ROUTES.APPLICANT.SETTINGS,
    icon: Settings,
    badge: 'Soon',
  },
]

interface ApplicantSidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export function ApplicantSidebar({ isCollapsed = false, onToggle }: ApplicantSidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        'relative flex h-full flex-col border-r bg-card transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">R</span>
          </div>
          {!isCollapsed && (
            <span className="text-lg font-semibold tracking-tight">RecruitMe</span>
          )}
        </Link>
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8"
            onClick={onToggle}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                isCollapsed && 'rotate-180'
              )}
            />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        <Separator className="my-4" />

        <nav className="space-y-1">
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Sign out */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 text-muted-foreground hover:text-foreground',
            isCollapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Sign out</span>}
        </Button>
      </div>
    </div>
  )
}

interface NavLinkProps {
  item: NavItem
  isActive: boolean
  isCollapsed: boolean
}

function NavLink({ item, isActive, isCollapsed }: NavLinkProps) {
  const Icon = item.icon

  return (
    <Link
      href={item.badge ? '#' : item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        isCollapsed && 'justify-center px-2',
        item.badge && 'cursor-not-allowed opacity-60'
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  )
}
