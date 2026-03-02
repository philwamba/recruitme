import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
    return (
        <div className="bg-background min-h-screen">
            <header className="absolute inset-x-0 top-0 z-50">
                <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
                    <div className="flex lg:flex-1">
                        <Link href="/" className="-m-1.5 p-1.5">
                            <span className="sr-only">RecruitMe</span>
                            <span className="text-xl font-bold tracking-tight text-foreground">RecruitMe</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3">
                        <Button asChild variant="ghost" size="sm" className="lg:size-default">
                            <Link href="/sign-in">Sign in</Link>
                        </Button>
                        <Button asChild size="sm" className="lg:size-default">
                            <Link href="/sign-up">Create account</Link>
                        </Button>
                    </div>
                </nav>
            </header>

            <div className="relative isolate px-6 pt-14 lg:px-8">
                <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
              Find the right candidates, faster.
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Post jobs, parse CVs, and shortlist applicants in one place.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-4">
                            <Button asChild size="lg">
                                <Link href="/jobs">Browse Jobs</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/sign-up">Get Started</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Counselling Section */}
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
                    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
                        <div className="lg:pr-8 lg:pt-4">
                            <div className="lg:max-w-lg">
                                <p className="text-sm font-semibold leading-7 text-primary">Guidance</p>
                                <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Career Counselling</h2>
                                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  Navigate your career path with confidence. Our expert counsellors provide personalized guidance to help you identify your strengths, explore opportunities, and achieve your professional goals.
                                </p>
                            </div>
                        </div>
                        <div className="relative aspect-video lg:aspect-auto lg:h-[400px]">
                            <Image
                                src="/counselling.png"
                                alt="Career Counselling Session"
                                className="absolute inset-0 h-full w-full rounded-2xl bg-muted object-cover ring-1 ring-border"
                                width={800}
                                height={600}
                            />
                        </div>
                    </div>
                </div>

                {/* Training Section */}
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
                    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
                        <div className="relative order-last lg:order-first aspect-video lg:aspect-auto lg:h-[400px]">
                            <Image
                                src="/training.png"
                                alt="Professional Training Workshop"
                                className="absolute inset-0 h-full w-full rounded-2xl bg-muted object-cover ring-1 ring-border"
                                width={800}
                                height={600}
                            />
                        </div>
                        <div className="lg:pl-8 lg:pt-4">
                            <div className="lg:max-w-lg">
                                <p className="text-sm font-semibold leading-7 text-primary">Upskill</p>
                                <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Professional Training</h2>
                                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  Stay ahead in your field with our comprehensive training programs. From technical skills to soft skills, we offer workshops and courses designed to enhance your employability and performance.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="border-t mt-24">
                    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                        <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} RecruitMe. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    )
}
