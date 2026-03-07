'use client'

import { useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
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
import { convertToJob } from '@/lib/admin/actions/job-requests'

interface ConvertToJobButtonProps {
    requestId: string
}

export function ConvertToJobButton({ requestId }: ConvertToJobButtonProps) {
    const [isConverting, setIsConverting] = useState(false)

    const handleConvert = async () => {
        setIsConverting(true)
        try {
            await convertToJob(requestId)
        } catch (error) {
            // Re-throw NEXT_REDIRECT errors so navigation works
            if (error && typeof error === 'object' && 'digest' in error) {
                const digest = (error as { digest?: string }).digest
                if (digest?.startsWith('NEXT_REDIRECT')) {
                    throw error
                }
            }
            alert(error instanceof Error ? error.message : 'An error occurred')
            setIsConverting(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Convert to Job
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Convert to Job Posting</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will create a new job posting based on this request.
                        The job will be created as a draft that you can edit and publish.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isConverting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConvert} disabled={isConverting}>
                        {isConverting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Convert
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
