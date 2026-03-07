'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileUpload } from '@/components/ui/file-upload'
import { Checkbox } from '@/components/ui/checkbox'
import { Briefcase, MapPin, Building2, Clock, CheckCircle2, Loader2, User, LogIn, UserPlus, Shield, Zap, FileText } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'

interface Job {
    id: string
    slug: string
    title: string
    company: string
    location: string | null
    employmentType: string
    workplaceType: string
}

interface ApplicationFormData {
    firstName: string
    lastName: string
    email: string
    phone: string
    coverLetter: string
    cvFile: File | null
    supportingDocuments: File[]
    consentAccepted: boolean
}

export default function ApplyPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const router = useRouter()
    const [job, setJob] = React.useState<Job | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [notFound, setNotFound] = React.useState(false)
    const [loadError, setLoadError] = React.useState<string | null>(null)
    const [submitting, setSubmitting] = React.useState(false)
    const [submitted, setSubmitted] = React.useState(false)
    const [trackingId, setTrackingId] = React.useState<string | null>(null)
    const [formError, setFormError] = React.useState<string | null>(null)

    const [formData, setFormData] = React.useState<ApplicationFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        coverLetter: '',
        cvFile: null,
        supportingDocuments: [],
        consentAccepted: false,
    })

    const [errors, setErrors] = React.useState<Partial<Record<keyof ApplicationFormData, string>>>({})

    // Resolve slug once from params
    const [slug, setSlug] = React.useState<string | null>(null)
    React.useEffect(() => {
        params.then(p => setSlug(p.slug))
    }, [params])

    React.useEffect(() => {
        if (!slug) return

        async function loadJob() {
            try {
                const response = await fetch(`/api/jobs/${slug}`)
                if (response.status === 404) {
                    setNotFound(true)
                } else if (!response.ok) {
                    setLoadError('Failed to load job details')
                } else {
                    const data = await response.json()
                    setJob(data)
                }
            } catch (error) {
                console.error('Failed to load job:', error)
                setLoadError('An error occurred while loading the job')
            } finally {
                setLoading(false)
            }
        }
        loadJob()
    }, [slug])

    function validateForm(): boolean {
        const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {}

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required'
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required'
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }
        if (!formData.cvFile) {
            newErrors.cvFile = 'CV is required to submit your application'
        }
        if (!formData.consentAccepted) {
            newErrors.consentAccepted = 'You must accept the data processing consent'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!validateForm() || !job) return

        setSubmitting(true)

        try {
            const submitData = new FormData()
            submitData.append('jobId', job.id)
            submitData.append('firstName', formData.firstName)
            submitData.append('lastName', formData.lastName)
            submitData.append('email', formData.email)
            submitData.append('phone', formData.phone)
            submitData.append('coverLetter', formData.coverLetter)
            submitData.append('consentAccepted', String(formData.consentAccepted))

            if (formData.cvFile) {
                submitData.append('cvFile', formData.cvFile)
            }

            formData.supportingDocuments.forEach((doc, index) => {
                submitData.append(`supportingDocument_${index}`, doc)
            })

            const response = await fetch('/api/applications/guest', {
                method: 'POST',
                body: submitData,
            })

            if (response.ok) {
                const result = await response.json()
                setTrackingId(result.trackingId)
                setSubmitted(true)
            } else {
                const errorData = await response.json()
                if (errorData.field && errorData.field in formData) {
                    setErrors({ [errorData.field]: errorData.message })
                } else {
                    setFormError(errorData.message || 'Failed to submit application')
                }
            }
        } catch (error) {
            console.error('Submit error:', error)
            setFormError('An error occurred. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-muted/30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (loadError) {
        return (
            <div className="min-h-screen bg-muted/30">
                <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                    <h1 className="text-2xl font-semibold">Failed to Load Job</h1>
                    <p className="mt-2 text-muted-foreground">
                        {loadError}
                    </p>
                    <Button asChild className="mt-6">
                        <Link href="/jobs">Browse All Jobs</Link>
                    </Button>
                </div>
            </div>
        )
    }

    if (notFound || !job) {
        return (
            <div className="min-h-screen bg-muted/30">
                <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                    <h1 className="text-2xl font-semibold">Job Not Found</h1>
                    <p className="mt-2 text-muted-foreground">
                        This position may no longer be available.
                    </p>
                    <Button asChild className="mt-6">
                        <Link href="/jobs">Browse All Jobs</Link>
                    </Button>
                </div>
            </div>
        )
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-muted/30">
                <div className="mx-auto max-w-2xl px-4 py-16 space-y-6">
                    {/* Success Card */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center py-8">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>
                                <h2 className="mt-6 text-2xl font-semibold">Application Submitted!</h2>
                                <p className="mt-2 text-muted-foreground max-w-md">
                                    Thank you for applying to <span className="font-medium text-foreground">{job.title}</span> at {job.company}.
                                    We&apos;ve sent a confirmation to your email.
                                </p>
                                {trackingId && (
                                    <div className="mt-6 rounded-lg bg-muted px-4 py-3">
                                        <p className="text-sm text-muted-foreground">Your tracking ID</p>
                                        <p className="font-mono text-lg font-semibold">{trackingId}</p>
                                    </div>
                                )}
                                <div className="mt-8 flex gap-3">
                                    <Button asChild variant="outline">
                                        <Link href={`/jobs/${job.slug}`}>View Job Details</Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href="/jobs">Browse More Jobs</Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Create Account Prompt */}
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <UserPlus className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Save Your Application</CardTitle>
                                    <CardDescription>
                                        Create an account to track this and future applications
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 text-sm">
                                <div className="flex items-start gap-3">
                                    <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                    <span className="text-muted-foreground">
                                        Your CV will be saved for faster applications
                                    </span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                    <span className="text-muted-foreground">
                                        Apply to future jobs with one click
                                    </span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                    <span className="text-muted-foreground">
                                        Track all your applications in one place
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Button asChild className="flex-1">
                                    <Link href={`${ROUTES.SIGN_UP}?email=${encodeURIComponent(formData.email)}&next=${encodeURIComponent(ROUTES.APPLICANT.APPLICATIONS)}`}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Create Account
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="flex-1">
                                    <Link href={`${ROUTES.SIGN_IN}?next=${encodeURIComponent(ROUTES.APPLICANT.APPLICATIONS)}`}>
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Sign In
                                    </Link>
                                </Button>
                            </div>
                            <p className="text-xs text-center text-muted-foreground">
                                Already have an account? Sign in to link this application to your profile.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="mx-auto max-w-3xl px-4 py-10">
                {/* Header */}
                <div className="space-y-4 mb-8">
                    <Link
                        href={`/jobs/${job.slug}`}
                        className="inline-flex items-center text-sm text-primary hover:underline"
                    >
                        ← Back to job details
                    </Link>
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">Apply for {job.title}</h1>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Building2 className="h-4 w-4" />
                                {job.company}
                            </span>
                            {job.location && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    {job.location}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Briefcase className="h-4 w-4" />
                                {job.employmentType.replace('_', ' ')}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {job.workplaceType}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Login/Signup Banner */}
                <Card className="mb-6 border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                    <CardContent className="py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Already have an account?</p>
                                    <p className="text-xs text-muted-foreground">
                                        Sign in for faster applications with your saved CV
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 sm:shrink-0">
                                <Button asChild size="sm" variant="outline" className="flex-1 sm:flex-none">
                                    <Link href={`${ROUTES.SIGN_IN}?next=${encodeURIComponent(`/jobs/${job.slug}/apply`)}`}>
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Sign In
                                    </Link>
                                </Button>
                                <Button asChild size="sm" className="flex-1 sm:flex-none">
                                    <Link href={`${ROUTES.SIGN_UP}?next=${encodeURIComponent(`/jobs/${job.slug}/apply`)}`}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Sign Up
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Application Form */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>
                                    Tell us about yourself so we can get in touch.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">
                                            First name <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                            placeholder="John"
                                            aria-invalid={!!errors.firstName}
                                        />
                                        {errors.firstName && (
                                            <p className="text-xs text-destructive">{errors.firstName}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">
                                            Last name <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                            placeholder="Doe"
                                            aria-invalid={!!errors.lastName}
                                        />
                                        {errors.lastName && (
                                            <p className="text-xs text-destructive">{errors.lastName}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            Email address <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="john@example.com"
                                            aria-invalid={!!errors.email}
                                        />
                                        {errors.email && (
                                            <p className="text-xs text-destructive">{errors.email}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="+254 712 345 678"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Documents */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Documents</CardTitle>
                                <CardDescription>
                                    Upload your CV and any supporting documents.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FileUpload
                                    label="CV / Resume"
                                    required
                                    accept=".pdf,.doc,.docx"
                                    value={formData.cvFile}
                                    onChange={(f) => {
                                        setFormData(prev => ({ ...prev, cvFile: f as File | null }))
                                        if (errors.cvFile) {
                                            setErrors(prev => ({ ...prev, cvFile: undefined }))
                                        }
                                    }}
                                    description="PDF, DOC, or DOCX (Max 5MB)"
                                    error={errors.cvFile}
                                />

                                <FileUpload
                                    label="Supporting Documents"
                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                    multiple
                                    value={formData.supportingDocuments}
                                    onChange={(f) => setFormData(prev => ({
                                        ...prev,
                                        supportingDocuments: f as File[]
                                    }))}
                                    description="Certificates, portfolios, or other relevant documents (optional)"
                                />
                            </CardContent>
                        </Card>

                        {/* Cover Letter */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Cover Letter</CardTitle>
                                <CardDescription>
                                    Tell us why you&apos;re a great fit for this role.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={formData.coverLetter}
                                    onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                                    placeholder="I am excited to apply for this position because..."
                                    rows={6}
                                />
                            </CardContent>
                        </Card>

                        {/* Consent & Submit */}
                        <Card>
                            <CardContent className="pt-6 space-y-6">
                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        id="consent"
                                        checked={formData.consentAccepted}
                                        onCheckedChange={(checked) => {
                                            setFormData(prev => ({ ...prev, consentAccepted: checked === true }))
                                            if (errors.consentAccepted) {
                                                setErrors(prev => ({ ...prev, consentAccepted: undefined }))
                                            }
                                        }}
                                        aria-invalid={!!errors.consentAccepted}
                                    />
                                    <div className="space-y-1">
                                        <label
                                            htmlFor="consent"
                                            className="text-sm leading-relaxed cursor-pointer"
                                        >
                                            I consent to RecruitMe storing and processing my personal data for the purpose of this job application.{' '}
                                            <span className="text-destructive">*</span>
                                        </label>
                                        {errors.consentAccepted && (
                                            <p className="text-xs text-destructive">{errors.consentAccepted}</p>
                                        )}
                                    </div>
                                </div>

                                {formError && (
                                    <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                                        <p className="text-sm text-destructive">{formError}</p>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full"
                                    disabled={submitting}
                                    onClick={() => setFormError(null)}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting Application...
                                        </>
                                    ) : (
                                        'Submit Application'
                                    )}
                                </Button>

                                <p className="text-xs text-center text-muted-foreground">
                                    By submitting, you agree to our{' '}
                                    <Link href="/privacy" className="text-primary hover:underline">
                                        Privacy Policy
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/terms" className="text-primary hover:underline">
                                        Terms of Service
                                    </Link>
                                    .
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </div>
    )
}
