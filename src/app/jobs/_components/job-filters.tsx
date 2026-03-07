'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { EmploymentType, WorkplaceType } from '@prisma/client'
import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Department {
    id: string
    name: string
    slug: string
}

interface Category {
    id: string
    name: string
    code: string
}

interface JobFiltersProps {
    departments: Department[]
    categories: Category[]
    locations: string[]
    defaultValues: {
        q: string
        department: string
        category: string
        employmentType: string
        workplaceType: string
        location: string
        salaryMin: string
        salaryMax: string
        postedWithin: string
    }
}

const selectClassName =
    'h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50'

const postedWithinOptions = [
    { value: '', label: 'Any time' },
    { value: '7', label: 'Last 7 days' },
    { value: '14', label: 'Last 14 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
]

export function JobFilters({ departments, categories, locations, defaultValues }: JobFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
    const searchParamsString = searchParams.toString()

    // Check if any advanced filters are active
    const hasAdvancedFilters = Boolean(
        defaultValues.category ||
        defaultValues.salaryMin ||
        defaultValues.salaryMax ||
        defaultValues.postedWithin,
    )

    // Initialize showAdvanced based on whether advanced filters are active
    const [showAdvanced, setShowAdvanced] = useState(hasAdvancedFilters)

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [])

    const updateFilter = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParamsString)
            if (value) {
                params.set(key, value)
            } else {
                params.delete(key)
            }
            params.delete('page')
            startTransition(() => {
                router.replace(`/jobs?${params.toString()}`)
            })
        },
        [router, searchParamsString],
    )

    const clearAllFilters = useCallback(() => {
        startTransition(() => {
            router.replace('/jobs')
        })
    }, [router])

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value

            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }

            debounceTimerRef.current = setTimeout(() => {
                const params = new URLSearchParams(searchParamsString)
                if (value) {
                    params.set('q', value)
                } else {
                    params.delete('q')
                }
                params.delete('page')
                startTransition(() => {
                    router.replace(`/jobs?${params.toString()}`)
                })
            }, 300)
        },
        [router, searchParamsString],
    )

    const handleSalaryChange = useCallback(
        (key: 'salaryMin' | 'salaryMax', value: string) => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }

            debounceTimerRef.current = setTimeout(() => {
                updateFilter(key, value)
            }, 500)
        },
        [updateFilter],
    )

    // Count active filters
    const activeFilterCount = [
        defaultValues.department,
        defaultValues.category,
        defaultValues.employmentType,
        defaultValues.workplaceType,
        defaultValues.location,
        defaultValues.salaryMin,
        defaultValues.salaryMax,
        defaultValues.postedWithin,
    ].filter(Boolean).length

    return (
        <div className="space-y-4">
            {/* Search bar */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        name="q"
                        defaultValue={defaultValues.q}
                        onChange={handleSearchChange}
                        placeholder="Search roles, companies, or keywords..."
                        aria-label="Search roles, companies, or keywords"
                        className="pl-10 h-12 text-base"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="h-12 px-4"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Filters</span>
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>
                <Button
                    type="button"
                    size="lg"
                    disabled={isPending}
                    onClick={() => startTransition(() => router.refresh())}
                    className="h-12 px-6"
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Search className="h-4 w-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">Search</span>
                </Button>
            </div>

            {/* Basic filters row */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <select
                    name="department"
                    defaultValue={defaultValues.department}
                    onChange={(e) => updateFilter('department', e.target.value)}
                    disabled={isPending}
                    aria-label="Filter by department"
                    className={selectClassName}
                >
                    <option value="">All departments</option>
                    {departments.map((department) => (
                        <option key={department.id} value={department.slug}>
                            {department.name}
                        </option>
                    ))}
                </select>

                <select
                    name="category"
                    defaultValue={defaultValues.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    disabled={isPending}
                    aria-label="Filter by category"
                    className={selectClassName}
                >
                    <option value="">All categories</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.code}>
                            {category.name}
                        </option>
                    ))}
                </select>

                <select
                    name="employmentType"
                    defaultValue={defaultValues.employmentType}
                    onChange={(e) => updateFilter('employmentType', e.target.value)}
                    disabled={isPending}
                    aria-label="Filter by job type"
                    className={selectClassName}
                >
                    <option value="">All job types</option>
                    {Object.values(EmploymentType).map((option) => (
                        <option key={option} value={option}>
                            {option.replaceAll('_', ' ')}
                        </option>
                    ))}
                </select>

                <select
                    name="workplaceType"
                    defaultValue={defaultValues.workplaceType}
                    onChange={(e) => updateFilter('workplaceType', e.target.value)}
                    disabled={isPending}
                    aria-label="Filter by workplace type"
                    className={selectClassName}
                >
                    <option value="">All workplace types</option>
                    {Object.values(WorkplaceType).map((option) => (
                        <option key={option} value={option}>
                            {option.replaceAll('_', ' ')}
                        </option>
                    ))}
                </select>
            </div>

            {/* Advanced filters (collapsible) */}
            {showAdvanced && (
                <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Advanced Filters</h3>
                        {activeFilterCount > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearAllFilters}
                                className="h-8 text-muted-foreground"
                            >
                                <X className="mr-1 h-3 w-3" />
                                Clear all
                            </Button>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <select
                            name="location"
                            defaultValue={defaultValues.location}
                            onChange={(e) => updateFilter('location', e.target.value)}
                            disabled={isPending}
                            aria-label="Filter by location"
                            className={selectClassName}
                        >
                            <option value="">All locations</option>
                            {locations.map((location) => (
                                <option key={location} value={location}>
                                    {location}
                                </option>
                            ))}
                        </select>

                        <select
                            name="postedWithin"
                            defaultValue={defaultValues.postedWithin}
                            onChange={(e) => updateFilter('postedWithin', e.target.value)}
                            disabled={isPending}
                            aria-label="Filter by posting date"
                            className={selectClassName}
                        >
                            {postedWithinOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Min Salary</label>
                            <Input
                                type="number"
                                name="salaryMin"
                                defaultValue={defaultValues.salaryMin}
                                onChange={(e) => handleSalaryChange('salaryMin', e.target.value)}
                                placeholder="e.g. 50000"
                                disabled={isPending}
                                className="h-10"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Max Salary</label>
                            <Input
                                type="number"
                                name="salaryMax"
                                defaultValue={defaultValues.salaryMax}
                                onChange={(e) => handleSalaryChange('salaryMax', e.target.value)}
                                placeholder="e.g. 150000"
                                disabled={isPending}
                                className="h-10"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
