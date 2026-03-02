'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AdminSidebar } from './admin-sidebar'

interface AdminMobileNavProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AdminMobileNav({ open, onOpenChange }: AdminMobileNavProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="sr-only">
                    <SheetTitle>Admin Navigation</SheetTitle>
                </SheetHeader>
                <AdminSidebar />
            </SheetContent>
        </Sheet>
    )
}
