import Link from 'next/link'

export function LinkedInAuthButton({
    nextPath,
    label,
}: {
  nextPath?: string
  label: string
}) {
    const query = nextPath ? `?next=${encodeURIComponent(nextPath)}` : ''

    return (
        <Link
            href={`/api/auth/linkedin/start${query}`}
            className={[
                'group relative flex h-11 w-full items-center justify-center gap-3 overflow-hidden rounded-xl',
                'bg-[#0A66C2] px-4 text-sm font-medium text-white',
                'shadow-sm transition-all duration-200',
                'hover:bg-[#004182] hover:shadow-md',
                'active:scale-[0.98] active:shadow-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66C2]/60 focus-visible:ring-offset-1',
            ].join(' ')}
        >
            {/* Official LinkedIn "in" SVG */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-5 shrink-0 fill-white transition-transform duration-200 group-hover:scale-105"
            >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <span className="flex-1 text-center">{label}</span>
        </Link>
    )
}
