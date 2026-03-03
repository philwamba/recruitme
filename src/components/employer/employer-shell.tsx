'use client'

import * as React from 'react'
import type { AuthenticatedUser } from '@/lib/auth'
import { EmployerSidebar } from './employer-sidebar'
import { EmployerHeader } from './employer-header'
import { EmployerMobileNav } from './employer-mobile-nav'
import { Toaster } from '@/components/ui/sonner'

const SIDEBAR_STORAGE_KEY = 'employer-sidebar-collapsed'

export function EmployerShell({
    children,
    user,
}: {
    children: React.ReactNode
    user: AuthenticatedUser
}) {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
    const [mobileNavOpen, setMobileNavOpen] = React.useState(false)

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
            if (stored === 'true') {
                setSidebarCollapsed(true)
            }
        }
    }, [])

    const handleToggleSidebar = React.useCallback(() => {
        setSidebarCollapsed(prev => {
            const newValue = !prev
            if (typeof window !== 'undefined') {
                localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newValue))
            }
            return newValue
        })
    }, [])

    return (
        <div className="flex h-screen overflow-hidden bg-muted/30">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <EmployerSidebar
                    isCollapsed={sidebarCollapsed}
                    onToggle={handleToggleSidebar}
                />
            </div>

            {/* Mobile Navigation */}
            <EmployerMobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <EmployerHeader user={user} onMenuClick={() => setMobileNavOpen(true)} />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-6 lg:p-8">
                        <div className="mx-auto max-w-7xl">{children}</div>
                    </div>
                </main>
            </div>

            <Toaster position="top-right" richColors />
        </div>
    )
}
