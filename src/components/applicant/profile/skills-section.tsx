'use client'

import * as React from 'react'
import { Lightbulb, Pencil, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { SectionCard, SectionEmptyState } from '@/components/ui/extended/section-card'
import { TagInput } from '@/components/ui/extended/tag-input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { updateSkills } from '@/app/actions/profile'
import type { ApplicantProfile } from '@/types/profile'

interface SkillsSectionProps {
  profile: ApplicantProfile
}

export function SkillsSection({ profile }: SkillsSectionProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const [skills, setSkills] = React.useState<string[]>(profile.skills ?? [])

  const hasSkills = profile.skills && profile.skills.length > 0

  async function handleSave() {
    setIsPending(true)
    const result = await updateSkills(skills)

    if (result.success) {
      toast.success('Skills updated')
      setIsEditing(false)
    } else {
      toast.error(result.error || 'Failed to update')
    }
    setIsPending(false)
  }

  function handleCancel() {
    setSkills(profile.skills ?? [])
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <SectionCard title="Skills" icon={Lightbulb}>
        <div className="space-y-4">
          <TagInput
            value={skills}
            onChange={setSkills}
            placeholder="Type a skill and press Enter..."
            maxTags={50}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={isPending}
            >
              <X className="mr-1.5 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              <Check className="mr-1.5 h-4 w-4" />
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="Skills"
      icon={Lightbulb}
      action={{
        label: hasSkills ? 'Edit' : 'Add',
        icon: Pencil,
        onClick: () => setIsEditing(true),
        variant: 'ghost',
      }}
    >
      {!hasSkills ? (
        <SectionEmptyState
          icon={Lightbulb}
          title="No skills added"
          description="Add your skills to help employers find you for the right opportunities."
          action={{
            label: 'Add Skills',
            onClick: () => setIsEditing(true),
          }}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-sm">
              {skill}
            </Badge>
          ))}
        </div>
      )}
    </SectionCard>
  )
}
