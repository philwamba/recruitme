import Link from 'next/link'

export function PublicFooter() {
    return (
        <footer className="border-t bg-muted/30">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} RecruitMe. All rights reserved.
                    </p>
                    <nav className="flex gap-6">
                        <Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground">
                            Jobs
                        </Link>
                        <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground">
                            Sign in
                        </Link>
                        <Link href="/sign-up" className="text-sm text-muted-foreground hover:text-foreground">
                            Get Started
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    )
}
