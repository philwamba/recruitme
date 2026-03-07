'use client'

import { useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { processApproval } from '@/lib/admin/actions/job-requests'

interface ApprovalActionsProps {
    approvalId: string
}

export function ApprovalActions({ approvalId }: ApprovalActionsProps) {
    const [comments, setComments] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)

    const handleDecision = async (status: 'APPROVED' | 'REJECTED') => {
        setIsProcessing(true)
        try {
            await processApproval(approvalId, { status, comments: comments || undefined })
        } catch (error) {
            alert(error instanceof Error ? error.message : 'An error occurred')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="comments">Comments (optional)</Label>
                <Textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add any comments about your decision..."
                    rows={3}
                />
            </div>

            <div className="flex gap-3">
                <Button
                    onClick={() => handleDecision('APPROVED')}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                >
                    {isProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Check className="mr-2 h-4 w-4" />
                    )}
                    Approve
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => handleDecision('REJECTED')}
                    disabled={isProcessing}
                    className="flex-1"
                >
                    {isProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <X className="mr-2 h-4 w-4" />
                    )}
                    Reject
                </Button>
            </div>
        </div>
    )
}
