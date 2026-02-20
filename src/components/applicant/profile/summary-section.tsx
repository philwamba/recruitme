'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Pencil, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { SectionCard, SectionEmptyState } from '@/components/ui/extended/section-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { summarySchema, type SummaryFormData } from '@/lib/validations/profile'
import { updateSummary } from '@/app/actions/profile'
import type { ApplicantProfile } from '@/types/profile'

interface SummarySectionProps {
  profile: ApplicantProfile
}

export function SummarySection({ profile }: SummarySectionProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)

  const form = useForm<SummaryFormData>({
    resolver: zodResolver(summarySchema),
    defaultValues: {
      headline: profile.headline ?? '',
      bio: profile.bio ?? '',
    },
  })

  const hasSummary = profile.headline || profile.bio

  async function onSubmit(data: SummaryFormData) {
    setIsPending(true)
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value ?? '')
    })

    const result = await updateSummary(formData)

    if (result.success) {
      toast.success('Summary updated')
      setIsEditing(false)
    } else {
      toast.error(result.error || 'Failed to update')
    }
    setIsPending(false)
  }

  if (isEditing) {
    return (
      <SectionCard title="Professional Summary" icon={FileText}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Headline</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Senior Software Engineer | React & Node.js"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief title that describes your current role or expertise
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About Me</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write a brief summary about yourself, your experience, and what you're looking for..."
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length ?? 0}/2000 characters
                  </FormDescription>
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
      title="Professional Summary"
      icon={FileText}
      action={{
        label: hasSummary ? 'Edit' : 'Add',
        icon: Pencil,
        onClick: () => setIsEditing(true),
        variant: 'ghost',
      }}
    >
      {!hasSummary ? (
        <SectionEmptyState
          icon={FileText}
          title="No summary added"
          description="Add a professional headline and bio to help employers understand who you are."
          action={{
            label: 'Add Summary',
            onClick: () => setIsEditing(true),
          }}
        />
      ) : (
        <div className="space-y-3">
          {profile.headline && (
            <h3 className="text-lg font-medium">{profile.headline}</h3>
          )}
          {profile.bio && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {profile.bio}
            </p>
          )}
        </div>
      )}
    </SectionCard>
  )
}
