'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Mail, Phone, MapPin, Pencil, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { SectionCard } from '@/components/ui/extended/section-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { personalInfoSchema, type PersonalInfoFormData } from '@/lib/validations/profile'
import { updatePersonalInfo } from '@/app/actions/profile'
import type { ApplicantProfile } from '@/types/profile'

interface PersonalInfoSectionProps {
  profile: ApplicantProfile
}

export function PersonalInfoSection({ profile }: PersonalInfoSectionProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)

  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      phone: profile.phone ?? '',
      city: profile.city ?? '',
      country: profile.country ?? '',
    },
  })

  const initials = `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase() || 'U'
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Your Name'
  const location = [profile.city, profile.country].filter(Boolean).join(', ')

  async function onSubmit(data: PersonalInfoFormData) {
    setIsPending(true)
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value ?? '')
    })

    const result = await updatePersonalInfo(formData)

    if (result.success) {
      toast.success('Personal information updated')
      setIsEditing(false)
    } else {
      toast.error(result.error || 'Failed to update')
    }
    setIsPending(false)
  }

  if (isEditing) {
    return (
      <SectionCard
        title="Personal Information"
        icon={User}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="United States" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
      title="Personal Information"
      icon={User}
      action={{
        label: 'Edit',
        icon: Pencil,
        onClick: () => setIsEditing(true),
        variant: 'ghost',
      }}
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatarUrl ?? ''} />
          <AvatarFallback className="bg-primary/10 text-primary text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-semibold">{fullName}</h3>
            {profile.headline && (
              <p className="text-sm text-muted-foreground">{profile.headline}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              demo@recruitme.com
            </span>
            {profile.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                {profile.phone}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {location}
              </span>
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
