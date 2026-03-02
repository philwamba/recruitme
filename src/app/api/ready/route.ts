import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPrivateStorageHealth } from '@/lib/services/private-files'
import { reportError } from '@/lib/observability/error-reporting'

export async function GET() {
    try {
        await prisma.$queryRaw`SELECT 1`
        const storage = getPrivateStorageHealth()

        // Sanitize storage info - don't expose internal paths
        const sanitizedStorage = {
            ok: storage.ok,
            driver: storage.driver,
            persistent: storage.persistent,
        }

        if (!storage.ok) {
            return NextResponse.json(
                {
                    status: 'degraded',
                    database: 'ok',
                    storage: sanitizedStorage,
                    timestamp: new Date().toISOString(),
                },
                { status: 503 },
            )
        }

        return NextResponse.json({
            status: 'ready',
            database: 'ok',
            storage: sanitizedStorage,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
    // Log detailed error server-side, return generic message to client
        reportError(error, { scope: 'api.ready' })
        return NextResponse.json(
            {
                status: 'error',
                error: 'Readiness check failed',
                timestamp: new Date().toISOString(),
            },
            { status: 503 },
        )
    }
}
