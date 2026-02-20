'use client'

import * as React from 'react'
import { FileText, Upload, FileUp, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'

export default function UploadCVPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'uploading' | 'complete'>('idle')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && isValidFile(droppedFile)) {
      setFile(droppedFile)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && isValidFile(selectedFile)) {
      setFile(selectedFile)
    }
  }

  function isValidFile(file: File): boolean {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ]
    return validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024
  }

  function handleUpload() {
    if (!file) return
    setUploadStatus('uploading')
    // Simulate upload - in production, this would call the server action
    setTimeout(() => {
      setUploadStatus('complete')
    }, 2000)
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
                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed
                    p-12 transition-colors cursor-pointer
                    ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
                    ${file ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="sr-only"
                  />

                  {file ? (
                    <>
                      <FileText className="h-12 w-12 text-green-600" />
                      <p className="mt-4 text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFile(null)
                        }}
                      >
                        Remove
                      </Button>
                    </>
                  ) : (
                    <>
                      <FileUp className="h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-sm font-medium">
                        Drag and drop your CV here
                      </p>
                      <p className="text-xs text-muted-foreground">
                        or click to browse
                      </p>
                    </>
                  )}
                </div>

                {/* Upload Button */}
                {file && uploadStatus === 'idle' && (
                  <Button onClick={handleUpload} className="w-full gap-2">
                    <Upload className="h-4 w-4" />
                    Upload CV
                  </Button>
                )}

                {uploadStatus === 'uploading' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span>Processing</span>
                    </div>
                    <Progress value={66} className="h-2" />
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
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
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
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
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
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
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
