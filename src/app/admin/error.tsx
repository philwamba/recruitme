'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Admin error:', error)
    }, [error])

    return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle>Something went wrong</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-sm text-muted-foreground">
                        An error occurred while loading this page. Please try again or contact support if the problem persists.
                    </p>
                    {error.digest && (
                        <p className="mt-2 text-center text-xs text-muted-foreground">
                            Error ID: {error.digest}
                        </p>
                    )}
                </CardContent>
                <CardFooter className="justify-center">
                    <Button onClick={reset} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Try again
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
