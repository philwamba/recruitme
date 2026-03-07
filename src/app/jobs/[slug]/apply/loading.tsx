import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function ApplyLoading() {
    return (
        <div className="min-h-screen bg-muted/20 py-12 px-4">
            <div className="mx-auto max-w-2xl">
                {/* Back Link */}
                <div className="mb-8">
                    <Skeleton className="h-4 w-32" />
                </div>

                {/* Application Card */}
                <Card className="border-none shadow-xl overflow-hidden bg-background">
                    <CardHeader className="space-y-6 pt-10 pb-8 text-center border-b bg-muted/10">
                        {/* Company Logo */}
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border bg-background shadow-sm">
                            <Skeleton className="h-12 w-12 rounded-full" />
                        </div>

                        {/* Company Name */}
                        <div className="space-y-2">
                            <Skeleton className="mx-auto h-3 w-48" />
                            <Skeleton className="mx-auto h-10 w-64" />
                        </div>

                        {/* Job Title and Ref */}
                        <div className="space-y-1">
                            <Skeleton className="mx-auto h-6 w-56" />
                            <Skeleton className="mx-auto h-4 w-24" />
                        </div>

                        {/* Share Button */}
                        <Skeleton className="mx-auto h-8 w-24" />
                    </CardHeader>

                    <CardContent className="p-8 sm:p-12">
                        <div className="space-y-6">
                            {/* First Name / Last Name */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-11 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-11 w-full" />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-11 w-full" />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-11 w-full" />
                            </div>

                            {/* CV Upload */}
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-24 w-full rounded-lg" />
                            </div>

                            {/* Consent and Submit */}
                            <div className="space-y-4 pt-4">
                                <div className="flex items-start space-x-3">
                                    <Skeleton className="h-4 w-4 shrink-0" />
                                    <div className="space-y-1 flex-1">
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-2/3" />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Skeleton className="h-12 w-full" />

                                {/* Powered by */}
                                <div className="text-center pt-2">
                                    <Skeleton className="mx-auto h-3 w-32" />
                                </div>

                                {/* Sign in Link */}
                                <div className="pt-6 border-t text-center">
                                    <Skeleton className="mx-auto h-4 w-48" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
