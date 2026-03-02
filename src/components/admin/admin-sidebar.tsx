'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, ChevronLeft, PanelLeftClose, PanelLeft } from 'lucide-react'
import { signOut } from '@/app/auth/actions'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { adminNavGroups, type NavItem } from './nav-config'
import { ROUTES } from '@/lib/constants/routes'

interface AdminSidebarProps {
    isCollapsed?: boolean
    onToggle?: () => void
}

export function AdminSidebar({ isCollapsed = false, onToggle }: AdminSidebarProps) {
    const pathname = usePathname()

    const isActive = (item: NavItem) => {
        if (pathname === item.href) return true
        if (item.matchPaths) {
            return item.matchPaths.some(path => pathname.startsWith(path))
        }
        return false
    }

    return (
        <TooltipProvider delayDuration={0}>
            <div
                className={cn(
                    'relative flex h-full flex-col border-r bg-card transition-all duration-300',
                    isCollapsed ? 'w-16' : 'w-64',
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center border-b px-4">
                    <Link href={ROUTES.ADMIN.DASHBOARD} className="flex items-center">
                        {isCollapsed ? (
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <span aria-hidden="true" className="text-lg font-bold text-primary-foreground">R</span>
                                <span className="sr-only">RecruitMe Admin</span>
                            </div>
                        ) : (
                            <Image
                                src="/logo.png"
                                alt="RecruitMe"
                                width={130}
                                height={36}
                                className="h-8 w-auto"
                            />
                        )}
                    </Link>
                    {onToggle && !isCollapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto h-8 w-8"
                            onClick={onToggle}
                            aria-label="Collapse sidebar"
                        >
                            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    )}
                </div>

                {/* Expand button when collapsed */}
                {isCollapsed && onToggle && (
                    <div className="flex justify-center py-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={onToggle}
                                    aria-label="Expand sidebar"
                                >
                                    <PanelLeft className="h-4 w-4" aria-hidden="true" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Expand sidebar</TooltipContent>
                        </Tooltip>
                    </div>
                )}

                {/* Navigation */}
                <ScrollArea className="flex-1 px-3 py-4">
                    {adminNavGroups.map((group, groupIndex) => (
                        <div key={group.title} className={cn(groupIndex > 0 && 'mt-4')}>
                            {!isCollapsed && (
                                <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {group.title}
                                </h4>
                            )}
                            {isCollapsed && groupIndex > 0 && <Separator className="my-2" />}
                            <nav className="space-y-1">
                                {group.items.map(item => (
                                    <NavLink
                                        key={item.href}
                                        item={item}
                                        isActive={isActive(item)}
                                        isCollapsed={isCollapsed}
                                    />
                                ))}
                            </nav>
                        </div>
                    ))}
                </ScrollArea>

                {/* Admin badge */}
                {!isCollapsed && (
                    <div className="border-t px-3 py-3">
                        <div className="rounded-lg bg-primary/5 px-3 py-2">
                            <p className="text-xs font-medium text-primary">Admin Console</p>
                            <p className="text-[10px] text-muted-foreground">Full platform access</p>
                        </div>
                    </div>
                )}

                {/* Sign out */}
                <div className="border-t p-3">
                    <form action={signOut}>
                        {isCollapsed ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="submit"
                                        variant="ghost"
                                        size="icon"
                                        className="w-full text-muted-foreground hover:text-foreground"
                                        aria-label="Sign out"
                                    >
                                        <LogOut className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">Sign out</TooltipContent>
                            </Tooltip>
                        ) : (
                            <Button
                                type="submit"
                                variant="ghost"
                                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                            >
                                <LogOut className="h-4 w-4" aria-hidden="true" />
                                <span>Sign out</span>
                            </Button>
                        )}
                    </form>
                </div>
            </div>
        </TooltipProvider>
    )
}

interface NavLinkProps {
    item: NavItem
    isActive: boolean
    isCollapsed: boolean
}

function NavLink({ item, isActive, isCollapsed }: NavLinkProps) {
    const Icon = item.icon
    const isDisabled = !!item.badge

    const linkContent = (
        <Link
            href={isDisabled ? '#' : item.href}
            aria-label={isCollapsed ? item.title : undefined}
            aria-disabled={isDisabled}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                isCollapsed && 'justify-center px-2',
                isDisabled && 'cursor-not-allowed opacity-60',
            )}
        >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
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

    if (isCollapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-2">
                    {item.title}
                    {item.badge && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                            {item.badge}
                        </span>
                    )}
                </TooltipContent>
            </Tooltip>
        )
    }

    return linkContent
}
