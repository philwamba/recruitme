'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Something went wrong</h2>
                <p className="max-w-md text-sm text-muted-foreground">
          The request failed unexpectedly. You can retry the page or return to the home screen.
                </p>
            </div>
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => reset()}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
          Try again
                </button>
                <Link href="/" className="rounded-md border px-4 py-2 text-sm font-medium">
          Go home
                </Link>
            </div>
        </div>
    )
}
