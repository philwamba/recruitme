import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    environment: env.appEnvironment,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  })
}
