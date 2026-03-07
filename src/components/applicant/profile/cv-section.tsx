'use client'

import * as React from 'react'
import Link from 'next/link'
import { FileText, Download, Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { SectionCard } from '@/components/ui/extended/section-card'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/ui/file-upload'
import { formatBytes } from '@/lib/utils'
import { uploadProfileCV } from '@/app/actions/profile'
import { ROUTES } from '@/lib/constants/routes'
import type { CandidateDocument } from '@/types/profile'

interface CVSectionProps {
    cvDocument: CandidateDocument | null
    cvFileName: string | null
}

export function CVSection({ cvDocument, cvFileName }: CVSectionProps) {
    const router = useRouter()
    const [isUploading, setIsUploading] = React.useState(false)
    const [showUpload, setShowUpload] = React.useState(false)
    const [file, setFile] = React.useState<File | null>(null)

    const hasCV = !!cvDocument || !!cvFileName
    const displayName = cvDocument?.originalFileName || cvFileName || 'CV'
    const fileSize = cvDocument?.sizeBytes ? formatBytes(cvDocument.sizeBytes) : null

    async function handleUpload() {
        if (!file) return

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append('cv', file)

            const result = await uploadProfileCV(formData)

            if (result.success) {
                toast.success('CV uploaded successfully')
                setFile(null)
                setShowUpload(false)
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to upload CV')
            }
        } catch {
            toast.error('An error occurred while uploading')
        } finally {
            setIsUploading(false)
        }
    }

    if (showUpload) {
        return (
            <SectionCard
                title="Resume / CV"
                icon={FileText}
            >
                <div className="space-y-4">
                    <FileUpload
                        accept=".pdf,.doc,.docx"
                        value={file}
                        onChange={(f) => setFile(f as File | null)}
                        description="PDF or Word documents (Max 5MB)"
                        maxSize={5 * 1024 * 1024}
                        disabled={isUploading}
                    />

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setShowUpload(false)
                                setFile(null)
                            }}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!file || isUploading}
                        >
                            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Upload CV
                        </Button>
                    </div>
                </div>
            </SectionCard>
        )
    }

    return (
        <SectionCard
            title="Resume / CV"
            icon={FileText}
            action={{
                label: hasCV ? 'Replace' : 'Upload',
                icon: Upload,
                onClick: () => setShowUpload(true),
                variant: 'ghost',
            }}
        >
            {hasCV ? (
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">{displayName}</p>
                            {fileSize && (
                                <p className="text-sm text-muted-foreground">{fileSize}</p>
                            )}
                        </div>
                    </div>

                    {cvDocument ? (
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/api/documents/${cvDocument.id}/download`} download>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </a>
                        </Button>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Document stored but download unavailable
                        </p>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="mt-3 text-sm font-medium">No CV uploaded yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Upload your CV to make applying easier
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setShowUpload(true)}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload CV
                    </Button>
                </div>
            )}
        </SectionCard>
    )
}
