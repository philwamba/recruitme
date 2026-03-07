'use client'

import * as React from 'react'
import { Share2, Copy } from 'lucide-react'
import { BsLinkedin, BsTwitterX, BsWhatsapp, BsFacebook } from 'react-icons/bs'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface JobShareProps {
    title: string
    slug: string
    variant?: 'outline' | 'ghost' | 'default' | 'secondary'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    className?: string
    showLabel?: boolean
}

export function JobShare({
    title,
    slug,
    variant = 'outline',
    size = 'default',
    className,
    showLabel = true,
}: JobShareProps) {
    const [shareUrl, setShareUrl] = React.useState('')

    React.useEffect(() => {
        setShareUrl(`${window.location.origin}/jobs/${slug}`)
    }, [slug])

    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(`Check out this job: ${title}`)

    const copyToClipboard = async () => {
        if (!shareUrl) return
        try {
            await navigator.clipboard.writeText(shareUrl)
            toast.success('Link copied to clipboard!')
        } catch {
            toast.error('Failed to copy link')
        }
    }

    const shareLinks = [
        {
            name: 'LinkedIn',
            icon: BsLinkedin,
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            color: '#0A66C2',
        },
        {
            name: 'X',
            icon: BsTwitterX,
            url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            color: '#000000',
        },
        {
            name: 'WhatsApp',
            icon: BsWhatsapp,
            url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
            color: '#25D366',
        },
        {
            name: 'Facebook',
            icon: BsFacebook,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            color: '#1877F2',
        },
    ]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size} className={cn('gap-2', className)}>
                    <Share2 className="h-4 w-4" />
                    {showLabel && <span>Share this job</span>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Share Position</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Job Link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {shareLinks.map(link => (
                    <DropdownMenuItem key={link.name} asChild className="cursor-pointer">
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center"
                        >
                            <link.icon
                                className="mr-2 h-4 w-4"
                                style={{ color: link.color }}
                            />
                            Share on {link.name}
                        </a>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
