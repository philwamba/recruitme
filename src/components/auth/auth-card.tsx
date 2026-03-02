import Image from 'next/image'
import Link from 'next/link'

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
        <div className="flex min-h-screen">
            {/* ── Left decorative panel ── */}
            <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-[oklch(0.637_0.178_30)] p-12 lg:flex">
                {/* Noise texture overlay */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-multiply"
                    style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
                    }}
                />

                {/* Large soft glow circles */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-white/10 blur-[120px]" />
                    <div className="absolute -right-20 top-1/3 h-[360px] w-[360px] rounded-full bg-white/10 blur-[100px]" />
                    <div className="absolute bottom-0 left-1/4 h-[280px] w-[280px] rounded-full bg-black/10 blur-[80px]" />
                </div>

                {/* Brandmark */}
                <div className="relative z-10">
                    <Link href="/" className="block transition-opacity hover:opacity-90">
                        <Image
                            src="/logo.png"
                            alt="RecruitMe"
                            width={180}
                            height={50}
                            className="h-12 w-auto brightness-0 invert"
                            priority
                        />
                    </Link>
                </div>

                {/* Centre content */}
                <div className="relative z-10 space-y-8">
                    {/* Decorative quote marks */}
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 48 36"
                        className="h-9 w-12 text-white/25"
                        fill="currentColor"
                    >
                        <path d="M13.415.001C6.07 5.185.887 13.681.887 23.041c0 7.632 4.608 12.096 9.936 12.096 5.04 0 8.784-4.032 8.784-8.784 0-4.752-3.312-8.208-7.632-8.208-.864 0-2.016.144-2.304.288.72-4.896 5.328-10.656 9.936-13.536L13.415.001zm24.768 0c-7.2 5.184-12.384 13.68-12.384 23.04 0 7.632 4.608 12.096 9.936 12.096 4.896 0 8.784-4.032 8.784-8.784 0-4.752-3.456-8.208-7.776-8.208-.864 0-1.872.144-2.16.288.72-4.896 5.184-10.656 9.792-13.536L38.183.001z" />
                    </svg>
                    <p className="text-2xl font-medium leading-snug text-white text-balance">
                        Find the right candidates, faster. Post jobs, parse CVs, and shortlist applicants—all in one place.
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {['#F4A261', '#E76F51', '#2A9D8F'].map((color, i) => (
                                <div
                                    key={i}
                                    aria-hidden="true"
                                    style={{ backgroundColor: color }}
                                    className="h-8 w-8 rounded-full ring-2 ring-white/40"
                                />
                            ))}
                        </div>
                        <p className="text-sm font-medium text-white/80">
                            Trusted by hundreds of recruiters
                        </p>
                    </div>
                </div>

                {/* Bottom feature pills */}
                <div className="relative z-10 flex flex-wrap gap-2">
                    {['AI-powered CV parsing', 'Pipeline tracking', 'Team collaboration'].map(feat => (
                        <span
                            key={feat}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-white/15 backdrop-blur-sm"
                        >
                            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-white/60" />
                            {feat}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">

                {/* Mobile-only brandmark */}
                <Link href="/" className="mb-8 block lg:hidden">
                    <Image
                        src="/logo.png"
                        alt="RecruitMe"
                        width={160}
                        height={44}
                        className="h-10 w-auto"
                    />
                </Link>

                <div className="w-full max-w-sm space-y-8">
                    {/* Header */}
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {title}
                        </h1>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>

                    {/* Form content */}
                    <div className="space-y-6">
                        {children}
                    </div>

                    {/* Footer */}
                    <p className="text-center text-sm text-muted-foreground">
                        {footerText}{' '}
                        <Link
                            href={footerLinkHref}
                            className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                            {footerLinkLabel}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
