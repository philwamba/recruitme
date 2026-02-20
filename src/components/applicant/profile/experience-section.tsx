'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Briefcase, Plus, Pencil, Trash2, Building2, MapPin, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { SectionCard, SectionEmptyState } from '@/components/ui/extended/section-card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ExperienceFormDialog } from './forms/experience-form'
import { deleteWorkExperience } from '@/app/actions/work-experience'
import type { WorkExperience } from '@/types/profile'

interface ExperienceSectionProps {
  experiences: WorkExperience[]
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingExperience, setEditingExperience] = React.useState<WorkExperience | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const hasExperiences = experiences.length > 0

  function handleAdd() {
    setEditingExperience(null)
    setIsFormOpen(true)
  }

  function handleEdit(experience: WorkExperience) {
    setEditingExperience(experience)
    setIsFormOpen(true)
  }

  async function handleDelete() {
    if (!deletingId) return

    setIsDeleting(true)
    const result = await deleteWorkExperience(deletingId)

    if (result.success) {
      toast.success('Work experience deleted')
    } else {
      toast.error(result.error || 'Failed to delete')
    }

    setIsDeleting(false)
    setDeletingId(null)
  }

  return (
    <>
      <SectionCard
        title="Work Experience"
        description={hasExperiences ? `${experiences.length} position${experiences.length > 1 ? 's' : ''}` : undefined}
        icon={Briefcase}
        action={{
          label: 'Add',
          icon: Plus,
          onClick: handleAdd,
        }}
      >
        {!hasExperiences ? (
          <SectionEmptyState
            icon={Briefcase}
            title="No work experience added"
            description="Add your work history to showcase your professional background."
            action={{
              label: 'Add Experience',
              onClick: handleAdd,
            }}
          />
        ) : (
          <div className="space-y-4">
            {experiences.map((experience, index) => (
              <ExperienceItem
                key={experience.id}
                experience={experience}
                isLast={index === experiences.length - 1}
                onEdit={() => handleEdit(experience)}
                onDelete={() => setDeletingId(experience.id)}
              />
            ))}
          </div>
        )}
      </SectionCard>

      {/* Add/Edit Dialog */}
      <ExperienceFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        experience={editingExperience}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Work Experience</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this work experience? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface ExperienceItemProps {
  experience: WorkExperience
  isLast: boolean
  onEdit: () => void
  onDelete: () => void
}

function ExperienceItem({ experience, isLast, onEdit, onDelete }: ExperienceItemProps) {
  const dateRange = `${format(new Date(experience.startDate), 'MMM yyyy')} - ${
    experience.isCurrent ? 'Present' : experience.endDate ? format(new Date(experience.endDate), 'MMM yyyy') : ''
  }`

  return (
    <div className={`relative flex gap-4 ${!isLast ? 'pb-4 border-b' : ''}`}>
      {/* Company icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
        <Building2 className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium">{experience.role}</h4>
            <p className="text-sm text-muted-foreground">{experience.company}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {experience.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {experience.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {dateRange}
          </span>
        </div>

        {experience.description && (
          <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
            {experience.description}
          </p>
        )}
      </div>
    </div>
  )
}
