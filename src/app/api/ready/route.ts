import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPrivateStorageHealth } from '@/lib/services/private-files'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    const storage = getPrivateStorageHealth()

    if (!storage.ok) {
      return NextResponse.json(
        {
          status: 'degraded',
          database: 'ok',
          storage,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      status: 'ready',
      database: 'ok',
      storage,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown readiness error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
