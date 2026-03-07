'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { EmploymentType, WorkplaceType } from '@prisma/client'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Department {
    id: string
    name: string
    slug: string
}

interface JobFiltersProps {
    departments: Department[]
    locations: string[]
    defaultValues: {
        q: string
        department: string
        employmentType: string
        workplaceType: string
        location: string
    }
}

export function JobFilters({ departments, locations, defaultValues }: JobFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const updateFilter = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value) {
                params.set(key, value)
            } else {
                params.delete(key)
            }
            params.delete('page')
            startTransition(() => {
                router.push(`/jobs?${params.toString()}`)
            })
        },
        [router, searchParams],
    )

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            const params = new URLSearchParams(searchParams.toString())
            if (value) {
                params.set('q', value)
            } else {
                params.delete('q')
            }
            params.delete('page')
            startTransition(() => {
                router.push(`/jobs?${params.toString()}`)
            })
        },
        [router, searchParams],
    )

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    name="q"
                    defaultValue={defaultValues.q}
                    onChange={handleSearchChange}
                    placeholder="Search roles, companies, or keywords..."
                    className="pl-10 h-12 text-base"
                />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <select
                    name="department"
                    defaultValue={defaultValues.department}
                    onChange={e => updateFilter('department', e.target.value)}
                    disabled={isPending}
                    className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="">All departments</option>
                    {departments.map(department => (
                        <option key={department.id} value={department.slug}>
                            {department.name}
                        </option>
                    ))}
                </select>

                <select
                    name="employmentType"
                    defaultValue={defaultValues.employmentType}
                    onChange={e => updateFilter('employmentType', e.target.value)}
                    disabled={isPending}
                    className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="">All job types</option>
                    {Object.values(EmploymentType).map(option => (
                        <option key={option} value={option}>
                            {option.replaceAll('_', ' ')}
                        </option>
                    ))}
                </select>

                <select
                    name="workplaceType"
                    defaultValue={defaultValues.workplaceType}
                    onChange={e => updateFilter('workplaceType', e.target.value)}
                    disabled={isPending}
                    className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="">All workplace types</option>
                    {Object.values(WorkplaceType).map(option => (
                        <option key={option} value={option}>
                            {option.replaceAll('_', ' ')}
                        </option>
                    ))}
                </select>

                <select
                    name="location"
                    defaultValue={defaultValues.location}
                    onChange={e => updateFilter('location', e.target.value)}
                    disabled={isPending}
                    className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="">All locations</option>
                    {locations.map(location => (
                        <option key={location} value={location}>
                            {location}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}
