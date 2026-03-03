'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { EmployerSidebar } from './employer-sidebar'

interface EmployerMobileNavProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EmployerMobileNav({ open, onOpenChange }: EmployerMobileNavProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="sr-only">
                    <SheetTitle>Employer Navigation</SheetTitle>
                </SheetHeader>
                <EmployerSidebar />
            </SheetContent>
        </Sheet>
    )
}
