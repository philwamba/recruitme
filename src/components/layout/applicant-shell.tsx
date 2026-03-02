'use client'

import * as React from 'react'
import type { AuthenticatedUser } from '@/lib/auth'
import { ApplicantSidebar } from '@/components/layout/applicant-sidebar'
import { ApplicantHeader } from '@/components/layout/applicant-header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Toaster } from '@/components/ui/sonner'

export function ApplicantShell({
    children,
    user,
}: {
  children: React.ReactNode
  user: AuthenticatedUser
}) {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
    const [mobileNavOpen, setMobileNavOpen] = React.useState(false)

    return (
        <div className="flex h-screen overflow-hidden bg-muted/30">
            <div className="hidden md:block">
                <ApplicantSidebar
                    isCollapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
            </div>

            <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <ApplicantHeader user={user} onMenuClick={() => setMobileNavOpen(true)} />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="mx-auto max-w-6xl">{children}</div>
                </main>
            </div>

            <Toaster position="top-right" richColors />
        </div>
    )
}
