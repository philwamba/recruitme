'use client'

import * as React from 'react'
import type { AuthenticatedUser } from '@/lib/auth'
import { AdminSidebar } from './admin-sidebar'
import { AdminHeader } from './admin-header'
import { AdminMobileNav } from './admin-mobile-nav'
import { Toaster } from '@/components/ui/sonner'

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-collapsed'

export function AdminShell({
    children,
    user,
}: {
    children: React.ReactNode
    user: AuthenticatedUser
}) {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
        }
        return false
    })
    const [mobileNavOpen, setMobileNavOpen] = React.useState(false)

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
                <AdminSidebar
                    isCollapsed={sidebarCollapsed}
                    onToggle={handleToggleSidebar}
                />
            </div>

            {/* Mobile Navigation */}
            <AdminMobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <AdminHeader user={user} onMenuClick={() => setMobileNavOpen(true)} />

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
