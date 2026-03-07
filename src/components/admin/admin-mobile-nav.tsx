'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AdminSidebar } from './admin-sidebar'
import type { SidebarCounts } from '@/lib/admin/queries/sidebar-counts'

interface AdminMobileNavProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    counts?: SidebarCounts
}

export function AdminMobileNav({ open, onOpenChange, counts }: AdminMobileNavProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="sr-only">
                    <SheetTitle>Admin Navigation</SheetTitle>
                </SheetHeader>
                <AdminSidebar counts={counts} />
            </SheetContent>
        </Sheet>
    )
}
