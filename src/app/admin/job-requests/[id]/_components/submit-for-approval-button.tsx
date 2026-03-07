'use client'

import { useState } from 'react'
import { Send, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { submitJobRequest } from '@/lib/admin/actions/job-requests'

interface Approver {
    id: string
    email: string
}

interface SubmitForApprovalButtonProps {
    requestId: string
    approvers: Approver[]
}

export function SubmitForApprovalButton({ requestId, approvers }: SubmitForApprovalButtonProps) {
    const [open, setOpen] = useState(false)
    const [selectedApprovers, setSelectedApprovers] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleToggleApprover = (approverId: string) => {
        setSelectedApprovers(prev =>
            prev.includes(approverId)
                ? prev.filter(id => id !== approverId)
                : [...prev, approverId],
        )
    }

    const handleSubmit = async () => {
        if (selectedApprovers.length === 0) {
            alert('Please select at least one approver')
            return
        }

        setIsSubmitting(true)
        try {
            await submitJobRequest(requestId, selectedApprovers)
            setOpen(false)
        } catch (error) {
            alert(error instanceof Error ? error.message : 'An error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Send className="mr-2 h-4 w-4" />
                    Submit for Approval
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Submit for Approval</DialogTitle>
                    <DialogDescription>
                        Select the approvers who need to review this job request.
                        They will be notified and asked to approve or reject.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <Label className="text-sm font-medium">Select Approvers</Label>
                    <div className="mt-3 space-y-3 max-h-60 overflow-y-auto">
                        {approvers.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No approvers available</p>
                        ) : (
                            approvers.map(approver => (
                                <div key={approver.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={approver.id}
                                        checked={selectedApprovers.includes(approver.id)}
                                        onCheckedChange={() => handleToggleApprover(approver.id)}
                                    />
                                    <Label
                                        htmlFor={approver.id}
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        {approver.email}
                                    </Label>
                                </div>
                            ))
                        )}
                    </div>
                    {selectedApprovers.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-3">
                            {selectedApprovers.length} approver{selectedApprovers.length > 1 ? 's' : ''} selected
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || selectedApprovers.length === 0}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
