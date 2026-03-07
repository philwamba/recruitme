'use client'

import * as React from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { FileUpload } from '@/components/ui/file-upload'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'

export default function UploadCVPage() {
    const [file, setFile] = React.useState<File | null>(null)
    const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'uploading' | 'complete'>('idle')
    const [progress, setProgress] = React.useState(0)
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

    // Cleanup interval on unmount
    React.useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    function handleUpload() {
        if (!file) return
        setUploadStatus('uploading')
        setProgress(0)

        // Clear any existing interval before starting a new one
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        // Simulate upload progress
        intervalRef.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current)
                        intervalRef.current = null
                    }
                    setUploadStatus('complete')
                    return 100
                }
                return prev + 10
            })
        }, 200)
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
                        {uploadStatus === 'complete' ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="mt-4 text-lg font-medium">CV Uploaded Successfully!</h3>
                                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                                    CV parsing is coming soon. For now, please fill in your profile manually.
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
                                    onChange={f => setFile(f as File | null)}
                                    description="PDF or Word documents work best for parsing"
                                    maxSize={5 * 1024 * 1024}
                                />

                                {/* Upload Button */}
                                {file && uploadStatus === 'idle' && (
                                    <Button onClick={handleUpload} className="w-full">
                                        Upload CV
                                    </Button>
                                )}

                                {uploadStatus === 'uploading' && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Uploading...</span>
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
