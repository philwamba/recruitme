import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { roleHasPermission } from '@/lib/security/permissions'
import { exportCandidateData } from '@/lib/services/compliance'

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'APPLICANT' || !roleHasPermission(user.role, 'MANAGE_SELF_PROFILE')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const payload = await exportCandidateData(user.id)

  return NextResponse.json(payload, {
    headers: {
      'Content-Disposition': 'attachment; filename="candidate-data-export.json"',
    },
  })
}
