'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { GraduationCap, Plus, Pencil, Trash2, Building2, Calendar } from 'lucide-react'
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
import { EducationFormDialog } from './forms/education-form'
import { deleteEducation } from '@/app/actions/education'
import type { Education } from '@/types/profile'

interface EducationSectionProps {
  educations: Education[]
}

export function EducationSection({ educations }: EducationSectionProps) {
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingEducation, setEditingEducation] = React.useState<Education | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const hasEducations = educations.length > 0

  function handleAdd() {
    setEditingEducation(null)
    setIsFormOpen(true)
  }

  function handleEdit(education: Education) {
    setEditingEducation(education)
    setIsFormOpen(true)
  }

  async function handleDelete() {
    if (!deletingId) return

    setIsDeleting(true)
    const result = await deleteEducation(deletingId)

    if (result.success) {
      toast.success('Education deleted')
    } else {
      toast.error(result.error || 'Failed to delete')
    }

    setIsDeleting(false)
    setDeletingId(null)
  }

  return (
    <>
      <SectionCard
        title="Education"
        icon={GraduationCap}
        action={{
          label: 'Add',
          icon: Plus,
          onClick: handleAdd,
        }}
      >
        {!hasEducations ? (
          <SectionEmptyState
            icon={GraduationCap}
            title="No education added"
            description="Add your educational background to showcase your qualifications."
            action={{
              label: 'Add Education',
              onClick: handleAdd,
            }}
          />
        ) : (
          <div className="space-y-4">
            {educations.map((education, index) => (
              <EducationItem
                key={education.id}
                education={education}
                isLast={index === educations.length - 1}
                onEdit={() => handleEdit(education)}
                onDelete={() => setDeletingId(education.id)}
              />
            ))}
          </div>
        )}
      </SectionCard>

      <EducationFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        education={editingEducation}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Education</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this education entry? This action cannot be undone.
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

function EducationItem({
  education,
  isLast,
  onEdit,
  onDelete,
}: {
  education: Education
  isLast: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const dateRange = education.startDate && education.endDate
    ? `${format(new Date(education.startDate), 'yyyy')} - ${format(new Date(education.endDate), 'yyyy')}`
    : education.endDate
    ? format(new Date(education.endDate), 'yyyy')
    : ''

  return (
    <div className={`relative flex gap-4 ${!isLast ? 'pb-4 border-b' : ''}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
        <GraduationCap className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium">{education.degree}</h4>
            <p className="text-sm text-muted-foreground">{education.institution}</p>
            {education.fieldOfStudy && (
              <p className="text-sm text-muted-foreground">{education.fieldOfStudy}</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {dateRange && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {dateRange}
          </div>
        )}
      </div>
    </div>
  )
}
