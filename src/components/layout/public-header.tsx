import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function PublicHeader() {
    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="RecruitMe"
                        width={140}
                        height={38}
                        className="h-9 w-auto"
                        priority
                    />
                </Link>

                <nav className="flex items-center gap-2">
                    <Button variant="ghost" asChild>
                        <Link href="/jobs">Browse Jobs</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/sign-in">Sign in</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/sign-up">Get Started</Link>
                    </Button>
                </nav>
            </div>
        </header>
    )
}
