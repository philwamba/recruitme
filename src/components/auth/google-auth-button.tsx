import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function GoogleAuthButton({
  nextPath,
  label,
}: {
  nextPath?: string
  label: string
}) {
  const query = nextPath ? `?next=${encodeURIComponent(nextPath)}` : ''

  return (
    <Button asChild variant="outline" className="w-full">
      <Link href={`/api/auth/google/start${query}`}>{label}</Link>
    </Button>
  )
}
