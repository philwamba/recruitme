'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link2, Linkedin, Github, Globe, Pencil, Check, X, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { SectionCard, SectionEmptyState } from '@/components/ui/extended/section-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { linksSchema, type LinksFormData } from '@/lib/validations/profile'
import { updateLinks } from '@/app/actions/profile'
import type { ApplicantProfile } from '@/types/profile'

interface LinksSectionProps {
  profile: ApplicantProfile
}

export function LinksSection({ profile }: LinksSectionProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)

  const form = useForm<LinksFormData>({
    resolver: zodResolver(linksSchema),
    defaultValues: {
      linkedinUrl: profile.linkedinUrl ?? '',
      githubUrl: profile.githubUrl ?? '',
      portfolioUrl: profile.portfolioUrl ?? '',
    },
  })

  const hasLinks = profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl

  async function onSubmit(data: LinksFormData) {
    setIsPending(true)
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value ?? '')
    })

    const result = await updateLinks(formData)

    if (result.success) {
      toast.success('Links updated')
      setIsEditing(false)
    } else {
      toast.error(result.error || 'Failed to update')
    }
    setIsPending(false)
  }

  if (isEditing) {
    return (
      <SectionCard title="Links" icon={Link2}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="https://linkedin.com/in/username"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="githubUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="https://github.com/username"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="portfolioUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio Website</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="https://yourportfolio.com"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  form.reset()
                  setIsEditing(false)
                }}
                disabled={isPending}
              >
                <X className="mr-1.5 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                <Check className="mr-1.5 h-4 w-4" />
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="Links"
      icon={Link2}
      action={{
        label: hasLinks ? 'Edit' : 'Add',
        icon: Pencil,
        onClick: () => setIsEditing(true),
        variant: 'ghost',
      }}
    >
      {!hasLinks ? (
        <SectionEmptyState
          icon={Link2}
          title="No links added"
          description="Add your LinkedIn, GitHub, or portfolio to help employers learn more about you."
          action={{
            label: 'Add Links',
            onClick: () => setIsEditing(true),
          }}
        />
      ) : (
        <div className="space-y-3">
          {profile.linkedinUrl && (
            <LinkItem
              icon={Linkedin}
              label="LinkedIn"
              url={profile.linkedinUrl}
            />
          )}
          {profile.githubUrl && (
            <LinkItem
              icon={Github}
              label="GitHub"
              url={profile.githubUrl}
            />
          )}
          {profile.portfolioUrl && (
            <LinkItem
              icon={Globe}
              label="Portfolio"
              url={profile.portfolioUrl}
            />
          )}
        </div>
      )}
    </SectionCard>
  )
}

function LinkItem({
  icon: Icon,
  label,
  url,
}: {
  icon: React.ElementType
  label: string
  url: string
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
    >
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{url}</p>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground" />
    </a>
  )
}
