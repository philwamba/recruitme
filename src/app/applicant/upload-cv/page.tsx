'use client'

import * as React from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { FileUpload } from '@/components/ui/file-upload'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import { uploadProfileCV } from '@/app/actions/profile'
import { useRouter } from 'next/navigation'

function Alert({ children, variant = 'default', className }: { children: React.ReactNode, variant?: 'default' | 'destructive', className?: string }) {
    return (
        <div className={cn(
            'relative w-full rounded-lg border p-4 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
            variant === 'destructive' ? 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive' : 'bg-background text-foreground',
            className,
        )}>
            {children}
        </div>
    )
}

function AlertTitle({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <h5 className={cn('mb-1 font-medium leading-none tracking-tight', className)}>
            {children}
        </h5>
    )
}

function AlertDescription({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn('text-sm [&_p]:leading-relaxed', className)}>
            {children}
        </div>
    )
}

export default function UploadCVPage() {
    const [file, setFile] = React.useState<File | null>(null)
    const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'uploading' | 'complete' | 'error'>('idle')
    const [progress, setProgress] = React.useState(0)
    const [error, setError] = React.useState<string | null>(null)
    const router = useRouter()

    async function handleUpload() {
        if (!file) return
        setUploadStatus('uploading')
        setProgress(10)
        setError(null)

        try {
            // Since we can't easily track progress with Server Actions, we'll simulate a bit of it
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return 90
                    }
                    return prev + 10
                })
            }, 300)

            const formData = new FormData()
            formData.append('cv', file)

            const result = await uploadProfileCV(formData)

            clearInterval(progressInterval)

            if (result.success) {
                setProgress(100)
                setUploadStatus('complete')
                router.refresh()
            } else {
                setUploadStatus('error')
                setError(result.error || 'Failed to upload CV')
            }
        } catch (err) {
            setUploadStatus('error')
            setError('An unexpected error occurred during upload')
            console.error('Upload error:', err)
        }
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Upload CV</h1>
                <p className="text-muted-foreground">
                    Upload your CV and we&apos;ll help you fill in your profile automatically.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Upload Section */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Upload Your CV</CardTitle>
                        <CardDescription>
                            Supported formats: PDF, DOC, DOCX (Max 5MB)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {uploadStatus === 'complete' ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="mt-4 text-lg font-medium">CV Uploaded Successfully!</h3>
                                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                                    Your CV has been saved to your profile.
                                    Coming soon: automatic data extraction.
                                </p>
                                <Button asChild className="mt-6">
                                    <Link href={ROUTES.APPLICANT.PROFILE}>
                                        Go to Profile
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <FileUpload
                                    accept=".pdf,.doc,.docx"
                                    value={file}
                                    onChange={f => {
                                        setFile(f as File | null)
                                        setUploadStatus('idle')
                                        setError(null)
                                    }}
                                    description="PDF or Word documents work best for parsing"
                                    maxSize={5 * 1024 * 1024}
                                    disabled={uploadStatus === 'uploading'}
                                />

                                {/* Upload Button */}
                                {file && (uploadStatus === 'idle' || uploadStatus === 'error') && (
                                    <Button onClick={handleUpload} className="w-full">
                                        Upload CV
                                    </Button>
                                )}

                                {uploadStatus === 'uploading' && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Uploading and scanning...</span>
                                            <span className="font-medium">{progress}%</span>
                                        </div>
                                        <Progress value={progress} className="h-2" />
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">How it works</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground shrink-0">
                                1
                            </div>
                            <div>
                                <p className="text-sm font-medium">Upload your CV</p>
                                <p className="text-xs text-muted-foreground">
                                    PDF or Word documents work best
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground shrink-0">
                                2
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    We parse your CV
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Coming soon: automatic data extraction
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground shrink-0">
                                3
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Review and edit
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Verify the extracted information
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
