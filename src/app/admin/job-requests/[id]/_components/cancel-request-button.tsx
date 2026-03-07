'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cancelJobRequest } from '@/lib/admin/actions/job-requests'

interface CancelRequestButtonProps {
    requestId: string
}

export function CancelRequestButton({ requestId }: CancelRequestButtonProps) {
    const [isCancelling, setIsCancelling] = useState(false)

    const handleCancel = async () => {
        setIsCancelling(true)
        try {
            await cancelJobRequest(requestId)
        } catch (error) {
            alert(error instanceof Error ? error.message : 'An error occurred')
        } finally {
            setIsCancelling(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive">
                    <X className="mr-2 h-4 w-4" />
                    Cancel Request
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Job Request</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to cancel this job request?
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isCancelling}>No, keep it</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleCancel}
                        disabled={isCancelling}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Yes, cancel request
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
