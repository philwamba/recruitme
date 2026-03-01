import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthCardProps {
  title: string
  description: string
  footerText: string
  footerLinkLabel: string
  footerLinkHref: string
  children: React.ReactNode
}

export function AuthCard({
  title,
  description,
  footerText,
  footerLinkLabel,
  footerLinkHref,
  children,
}: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          {footerText}&nbsp;
          <Link href={footerLinkHref} className="font-medium text-primary hover:underline">
            {footerLinkLabel}
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
