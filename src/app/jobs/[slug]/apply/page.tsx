'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileUpload } from '@/components/ui/file-upload'
import { Checkbox } from '@/components/ui/checkbox'
import { Building2, CheckCircle2, Loader2, LogIn, UserPlus, Shield, Zap, FileText, User, Mail, Phone } from 'lucide-react'
import { JobShare } from '@/components/shared/job-share'
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
    const [job, setJob] = React.useState<Job | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [notFound, setNotFound] = React.useState(false)
    const [loadError, setLoadError] = React.useState<string | null>(null)
    const [submitting, setSubmitting] = React.useState(false)
    const [submitted, setSubmitted] = React.useState(false)
    const [trackingId, setTrackingId] = React.useState<string | null>(null)
    const [formError, setFormError] = React.useState<string | null>(null)
    const isSubmittingRef = React.useRef(false)

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

        if (isSubmittingRef.current) return
        setFormError('')

        if (!validateForm() || !job) return

        isSubmittingRef.current = true
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
            isSubmittingRef.current = false
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
        <div className="min-h-screen bg-muted/20 py-12 px-4">
            <div className="mx-auto max-w-2xl">
                {/* Header Back Link */}
                <div className="mb-8">
                    <Link
                        href={`/jobs/${job.slug}`}
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        ← Back to job details
                    </Link>
                </div>

                {/* Registration/Application Card */}
                <Card className="border-none shadow-xl overflow-hidden bg-background">
                    <CardHeader className="space-y-6 pt-10 pb-8 text-center border-b bg-muted/10">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border bg-background shadow-sm">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-primary" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Sign up to submit your application to</p>
                            <h1 className="text-4xl font-bold tracking-tight text-foreground">{job.company}</h1>
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold text-foreground">{job.title}</h2>
                            <p className="text-sm text-muted-foreground font-mono">Ref: {job.id.slice(0, 8).toUpperCase()}</p>
                        </div>

                        <div className="flex justify-center">
                            <JobShare title={job.title} slug={job.slug} variant="ghost" size="sm" showLabel={true} className="text-muted-foreground" />
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 sm:p-12">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">First name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="firstName"
                                            className="pl-9 h-11"
                                            value={formData.firstName}
                                            onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                            placeholder="First name"
                                        />
                                    </div>
                                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Last name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="lastName"
                                            className="pl-9 h-11"
                                            value={formData.lastName}
                                            onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                            placeholder="Last name"
                                        />
                                    </div>
                                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        className="pl-9 h-11"
                                        value={formData.email}
                                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="Email address"
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        className="pl-9 h-11"
                                        value={formData.phone}
                                        onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        placeholder="(+254) 7..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cv" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Select CV</Label>
                                <FileUpload
                                    accept=".pdf,.doc,.docx"
                                    value={formData.cvFile}
                                    onChange={f => setFormData(prev => ({ ...prev, cvFile: f as File | null }))}
                                    description="PDF or Word (Max 5MB)"
                                />
                                {errors.cvFile && <p className="text-xs text-destructive">{errors.cvFile}</p>}
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        id="consent"
                                        checked={formData.consentAccepted}
                                        onCheckedChange={checked => setFormData(prev => ({ ...prev, consentAccepted: checked === true }))}
                                    />
                                    <div className="text-xs leading-relaxed text-muted-foreground">
                                        By clicking Sign Up & Apply, you agree to our{' '}
                                        <Link href="/terms" className="text-primary hover:underline">Terms & Conditions</Link> and{' '}
                                        <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                                    </div>
                                </div>
                                {errors.consentAccepted && <p className="text-xs text-destructive">{errors.consentAccepted}</p>}

                                {formError && (
                                    <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                                        <p className="text-sm text-destructive">{formError}</p>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full h-12 text-md font-bold shadow-lg shadow-primary/20"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : 'Sign up & apply'}
                                </Button>

                                <div className="text-center pt-2">
                                    <p className="text-xs text-muted-foreground">powered by <span className="font-bold text-foreground">RecruitMe</span></p>
                                </div>

                                <div className="pt-6 border-t text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Already have an account?{' '}
                                        <Link href={`${ROUTES.SIGN_IN}?next=${encodeURIComponent(`/jobs/${job.slug}/apply`)}`} className="text-primary font-semibold hover:underline">
                                            Sign in & apply
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
