import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
            <div className="space-y-2">
                <h1 className="text-3xl font-semibold">Page not found</h1>
                <p className="max-w-md text-sm text-muted-foreground">
          The page you requested does not exist or may have moved.
                </p>
            </div>
            <Link href="/" className="rounded-md border px-4 py-2 text-sm font-medium">
        Return home
            </Link>
        </div>
    )
}
