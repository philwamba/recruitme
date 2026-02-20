'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Award, Plus, Pencil, Trash2, ExternalLink, Calendar } from 'lucide-react'
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
import { CertificationFormDialog } from './forms/certification-form'
import { deleteCertification } from '@/app/actions/certifications'
import type { Certification } from '@/types/profile'

interface CertificationsSectionProps {
  certifications: Certification[]
}

export function CertificationsSection({ certifications }: CertificationsSectionProps) {
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingCert, setEditingCert] = React.useState<Certification | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const hasCertifications = certifications.length > 0

  function handleAdd() {
    setEditingCert(null)
    setIsFormOpen(true)
  }

  function handleEdit(cert: Certification) {
    setEditingCert(cert)
    setIsFormOpen(true)
  }

  async function handleDelete() {
    if (!deletingId) return

    setIsDeleting(true)
    const result = await deleteCertification(deletingId)

    if (result.success) {
      toast.success('Certification deleted')
    } else {
      toast.error(result.error || 'Failed to delete')
    }

    setIsDeleting(false)
    setDeletingId(null)
  }

  return (
    <>
      <SectionCard
        title="Certifications"
        description="Optional"
        icon={Award}
        action={{
          label: 'Add',
          icon: Plus,
          onClick: handleAdd,
        }}
      >
        {!hasCertifications ? (
          <SectionEmptyState
            icon={Award}
            title="No certifications added"
            description="Add any professional certifications you've earned."
            action={{
              label: 'Add Certification',
              onClick: handleAdd,
            }}
          />
        ) : (
          <div className="space-y-3">
            {certifications.map((cert) => (
              <CertificationItem
                key={cert.id}
                certification={cert}
                onEdit={() => handleEdit(cert)}
                onDelete={() => setDeletingId(cert.id)}
              />
            ))}
          </div>
        )}
      </SectionCard>

      <CertificationFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        certification={editingCert}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this certification? This action cannot be undone.
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

function CertificationItem({
  certification,
  onEdit,
  onDelete,
}: {
  certification: Certification
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted flex-shrink-0">
          <Award className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium truncate">{certification.name}</h4>
            {certification.credentialUrl && (
              <a
                href={certification.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {certification.issuingOrg && <span>{certification.issuingOrg}</span>}
            {certification.issueDate && (
              <>
                <span>•</span>
                <span>{format(new Date(certification.issueDate), 'MMM yyyy')}</span>
              </>
            )}
          </div>
        </div>
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
  )
}
