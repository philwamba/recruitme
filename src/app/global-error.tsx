'use client'

export default function GlobalError({
    error,
    reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
    console.error(error)

    return (
        <html lang="en">
            <body className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
                <div className="space-y-4 text-center">
                    <h1 className="text-3xl font-semibold">Application failure</h1>
                    <p className="max-w-md text-sm text-muted-foreground">
            A fatal error occurred while rendering the application shell.
                    </p>
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
            Retry
                    </button>
                </div>
            </body>
        </html>
    )
}
