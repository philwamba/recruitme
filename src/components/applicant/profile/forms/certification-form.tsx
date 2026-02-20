'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { certificationSchema, type CertificationFormData } from '@/lib/validations/certification'
import { createCertification, updateCertification } from '@/app/actions/certifications'
import type { Certification } from '@/types/profile'

interface CertificationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  certification: Certification | null
}

export function CertificationFormDialog({
  open,
  onOpenChange,
  certification,
}: CertificationFormDialogProps) {
  const [isPending, setIsPending] = React.useState(false)
  const isEditing = !!certification

  const form = useForm<CertificationFormData>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      name: '',
      issuingOrg: '',
      issueDate: null,
      expirationDate: null,
      credentialUrl: '',
    },
  })

  React.useEffect(() => {
    if (open) {
      if (certification) {
        form.reset({
          name: certification.name,
          issuingOrg: certification.issuingOrg ?? '',
          issueDate: certification.issueDate ? new Date(certification.issueDate) : null,
          expirationDate: certification.expirationDate ? new Date(certification.expirationDate) : null,
          credentialUrl: certification.credentialUrl ?? '',
        })
      } else {
        form.reset({
          name: '',
          issuingOrg: '',
          issueDate: null,
          expirationDate: null,
          credentialUrl: '',
        })
      }
    }
  }, [open, certification, form])

  async function onSubmit(data: CertificationFormData) {
    setIsPending(true)

    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('issuingOrg', data.issuingOrg ?? '')
    formData.append('issueDate', data.issueDate?.toISOString() ?? '')
    formData.append('expirationDate', data.expirationDate?.toISOString() ?? '')
    formData.append('credentialUrl', data.credentialUrl ?? '')

    const result = isEditing
      ? await updateCertification(certification.id, formData)
      : await createCertification(formData)

    if (result.success) {
      toast.success(isEditing ? 'Certification updated' : 'Certification added')
      onOpenChange(false)
    } else {
      toast.error(result.error || 'Something went wrong')
    }

    setIsPending(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Certification' : 'Add Certification'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of this certification.'
              : 'Add details about your certification.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certification Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., AWS Solutions Architect" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issuingOrg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issuing Organization</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Amazon Web Services" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Issue Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'MMM yyyy') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiration Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'MMM yyyy') : <span>No expiration</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="credentialUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credential URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : isEditing ? 'Update' : 'Add Certification'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
