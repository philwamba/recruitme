'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { OrganizationType } from '@prisma/client'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    organizationFormSchema,
    organizationTypes,
    type OrganizationFormData,
} from '@/lib/admin/validations/organization'
import { createOrganization, updateOrganization } from '@/lib/admin/actions/organizations'

interface OrganizationForSelect {
    id: string
    name: string
    code: string
    type: OrganizationType
    parentId: string | null
}

interface AdminUser {
    id: string
    email: string
}

interface OrganizationFormProps {
    organization?: {
        id: string
        name: string
        code: string
        type: OrganizationType
        parentId: string | null
        managerId: string | null
        isActive: boolean
    }
    organizations: OrganizationForSelect[]
    adminUsers: AdminUser[]
}

export function OrganizationForm({
    organization,
    organizations,
    adminUsers,
}: OrganizationFormProps) {
    const isEditing = !!organization

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<OrganizationFormData>({
        resolver: zodResolver(organizationFormSchema),
        defaultValues: {
            name: organization?.name ?? '',
            code: organization?.code ?? '',
            type: organization?.type ?? 'DEPARTMENT',
            parentId: organization?.parentId ?? null,
            managerId: organization?.managerId ?? null,
            isActive: organization?.isActive ?? true,
        },
    })

    const currentType = watch('type')
    const isActive = watch('isActive')

    // Filter out current org and its descendants from parent options
    const getDescendantIds = (parentId: string, allOrgs: OrganizationForSelect[]): string[] => {
        const children = allOrgs.filter(org => org.parentId === parentId)
        return children.reduce((acc, child) => {
            return [...acc, child.id, ...getDescendantIds(child.id, allOrgs)]
        }, [] as string[])
    }

    const forbiddenIds = organization
        ? [organization.id, ...getDescendantIds(organization.id, organizations)]
        : []

    const parentOptions = organizations.filter(org => !forbiddenIds.includes(org.id))

    const onSubmit = async (data: OrganizationFormData) => {
        try {
            if (isEditing) {
                await updateOrganization(organization.id, data)
            } else {
                await createOrganization(data)
            }
        } catch (error) {
            alert(error instanceof Error ? error.message : 'An error occurred')
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                        id="name"
                        {...register('name')}
                        placeholder="e.g., Engineering"
                    />
                    {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="code">Code *</Label>
                    <Input
                        id="code"
                        {...register('code', {
                            onChange: e => setValue('code', e.target.value.toUpperCase()),
                        })}
                        placeholder="e.g., ENG"
                        className="uppercase"
                    />
                    {errors.code && (
                        <p className="text-sm text-destructive">{errors.code.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                        value={currentType}
                        onValueChange={value => setValue('type', value as OrganizationType)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {organizationTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.type && (
                        <p className="text-sm text-destructive">{errors.type.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="parentId">Parent Organization</Label>
                    <Select
                        value={watch('parentId') ?? '__none__'}
                        onValueChange={value => setValue('parentId', value === '__none__' ? null : value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="None (Top level)" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__none__">None (Top level)</SelectItem>
                            {parentOptions.map(org => (
                                <SelectItem key={org.id} value={org.id}>
                                    {org.name} ({org.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="managerId">Manager</Label>
                    <Select
                        value={watch('managerId') ?? '__none__'}
                        onValueChange={value => setValue('managerId', value === '__none__' ? null : value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select manager" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__none__">No manager</SelectItem>
                            {adminUsers.map(user => (
                                <SelectItem key={user.id} value={user.id}>
                                    {user.email}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                    <Switch
                        id="isActive"
                        checked={isActive}
                        onCheckedChange={checked => setValue('isActive', checked)}
                    />
                    <Label htmlFor="isActive">Active</Label>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Update Organization' : 'Create Organization'}
                </Button>
            </div>
        </form>
    )
}
