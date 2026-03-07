'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { ApplicationStatus } from '@prisma/client'
import {
    Bookmark,
    ChevronDown,
    Filter,
    Loader2,
    RotateCcw,
    Save,
    Search,
    SlidersHorizontal,
    X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { createSavedSearch } from '@/lib/admin/actions/saved-searches'

interface Job {
    id: string
    title: string
    company: string
}

interface Tag {
    id: string
    name: string
    color: string | null
}

interface SavedSearch {
    id: string
    name: string
    filters: Record<string, unknown>
    isPublic: boolean
    user: {
        email: string
    }
}

interface CandidateFiltersProps {
    jobs: Job[]
    tags: Tag[]
    skills: string[]
    savedSearches: SavedSearch[]
    defaultValues: {
        search: string
        status: string
        jobId: string
        skills: string[]
        tags: string[]
        minRating: string
        maxRating: string
        location: string
        appliedAfter: string
        appliedBefore: string
        hasDocuments: string
    }
}

const selectClassName =
    'h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50'

const statusOptions = [
    { value: '', label: 'All statuses' },
    ...Object.values(ApplicationStatus)
        .filter(s => s !== 'DRAFT')
        .map(status => ({
            value: status,
            label: status.replaceAll('_', ' '),
        })),
]

export function CandidateFilters({
    jobs,
    tags,
    skills,
    savedSearches,
    defaultValues,
}: CandidateFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [saveDialogOpen, setSaveDialogOpen] = useState(false)
    const [searchName, setSearchName] = useState('')
    const [isPublicSearch, setIsPublicSearch] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
    const searchParamsString = searchParams.toString()

    // Check if any advanced filters are active
    const hasAdvancedFilters =
        defaultValues.skills.length > 0 ||
        defaultValues.tags.length > 0 ||
        defaultValues.minRating ||
        defaultValues.maxRating ||
        defaultValues.location ||
        defaultValues.appliedAfter ||
        defaultValues.appliedBefore ||
        defaultValues.hasDocuments

    useEffect(() => {
        if (hasAdvancedFilters) {
            setShowAdvanced(true)
        }
    }, [hasAdvancedFilters])

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [])

    const updateFilter = useCallback(
        (key: string, value: string | string[]) => {
            const params = new URLSearchParams(searchParamsString)
            if (Array.isArray(value)) {
                params.delete(key)
                value.forEach(v => params.append(key, v))
            } else if (value) {
                params.set(key, value)
            } else {
                params.delete(key)
            }
            params.delete('page')
            startTransition(() => {
                router.replace(`/admin/candidates?${params.toString()}`)
            })
        },
        [router, searchParamsString],
    )

    const clearAllFilters = useCallback(() => {
        startTransition(() => {
            router.replace('/admin/candidates')
        })
    }, [router])

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value

            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }

            debounceTimerRef.current = setTimeout(() => {
                updateFilter('search', value)
            }, 300)
        },
        [updateFilter],
    )

    const handleSkillToggle = useCallback(
        (skill: string) => {
            const currentSkills = defaultValues.skills
            const newSkills = currentSkills.includes(skill)
                ? currentSkills.filter(s => s !== skill)
                : [...currentSkills, skill]
            updateFilter('skills', newSkills)
        },
        [defaultValues.skills, updateFilter],
    )

    const handleTagToggle = useCallback(
        (tagId: string) => {
            const currentTags = defaultValues.tags
            const newTags = currentTags.includes(tagId)
                ? currentTags.filter(t => t !== tagId)
                : [...currentTags, tagId]
            updateFilter('tags', newTags)
        },
        [defaultValues.tags, updateFilter],
    )

    const applySavedSearch = useCallback(
        (filters: Record<string, unknown>) => {
            const params = new URLSearchParams()
            Object.entries(filters).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(key, String(v)))
                } else if (value) {
                    params.set(key, String(value))
                }
            })
            startTransition(() => {
                router.replace(`/admin/candidates?${params.toString()}`)
            })
        },
        [router],
    )

    const handleSaveSearch = async () => {
        if (!searchName.trim()) return

        setIsSaving(true)
        try {
            const currentFilters = {
                search: defaultValues.search || undefined,
                status: (defaultValues.status || undefined) as ApplicationStatus | undefined,
                jobId: defaultValues.jobId || undefined,
                skills: defaultValues.skills.length > 0 ? defaultValues.skills : undefined,
                tags: defaultValues.tags.length > 0 ? defaultValues.tags : undefined,
                minRating: defaultValues.minRating ? Number(defaultValues.minRating) : undefined,
                maxRating: defaultValues.maxRating ? Number(defaultValues.maxRating) : undefined,
                location: defaultValues.location || undefined,
                appliedAfter: defaultValues.appliedAfter || undefined,
                appliedBefore: defaultValues.appliedBefore || undefined,
                hasDocuments: defaultValues.hasDocuments ? defaultValues.hasDocuments === 'true' : undefined,
            }

            await createSavedSearch({
                name: searchName,
                filters: currentFilters,
                isPublic: isPublicSearch,
            })

            setSaveDialogOpen(false)
            setSearchName('')
            setIsPublicSearch(false)
            router.refresh()
        } catch (error) {
            console.error('Failed to save search:', error)
        } finally {
            setIsSaving(false)
        }
    }

    // Count active filters
    const activeFilterCount = [
        defaultValues.status,
        defaultValues.jobId,
        defaultValues.location,
        defaultValues.minRating,
        defaultValues.maxRating,
        defaultValues.appliedAfter,
        defaultValues.appliedBefore,
        defaultValues.hasDocuments,
        ...defaultValues.skills,
        ...defaultValues.tags,
    ].filter(Boolean).length

    return (
        <div className="space-y-4">
            {/* Search bar */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        name="search"
                        defaultValue={defaultValues.search}
                        onChange={handleSearchChange}
                        placeholder="Search by name, email, or tracking ID..."
                        aria-label="Search candidates"
                        className="pl-10 h-11"
                    />
                </div>

                {/* Saved searches dropdown */}
                {savedSearches.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="lg" className="h-11">
                                <Bookmark className="h-4 w-4" />
                                <span className="ml-2 hidden sm:inline">Saved</span>
                                <ChevronDown className="ml-1 h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            {savedSearches.map(search => (
                                <DropdownMenuItem
                                    key={search.id}
                                    onClick={() => applySavedSearch(search.filters)}
                                >
                                    <div className="flex items-center gap-2">
                                        {search.isPublic && (
                                            <Badge variant="outline" className="text-xs">
                                                Public
                                            </Badge>
                                        )}
                                        <span className="truncate">{search.name}</span>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="h-11 px-4"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Filters</span>
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>

                {isPending && (
                    <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {/* Basic filters row */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <select
                    name="status"
                    defaultValue={defaultValues.status}
                    onChange={e => updateFilter('status', e.target.value)}
                    disabled={isPending}
                    aria-label="Filter by status"
                    className={selectClassName}
                >
                    {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <select
                    name="jobId"
                    defaultValue={defaultValues.jobId}
                    onChange={e => updateFilter('jobId', e.target.value)}
                    disabled={isPending}
                    aria-label="Filter by job"
                    className={selectClassName}
                >
                    <option value="">All jobs</option>
                    {jobs.map(job => (
                        <option key={job.id} value={job.id}>
                            {job.title} - {job.company}
                        </option>
                    ))}
                </select>

                <Input
                    type="text"
                    name="location"
                    defaultValue={defaultValues.location}
                    onChange={e => {
                        if (debounceTimerRef.current) {
                            clearTimeout(debounceTimerRef.current)
                        }
                        debounceTimerRef.current = setTimeout(() => {
                            updateFilter('location', e.target.value)
                        }, 300)
                    }}
                    placeholder="Location..."
                    disabled={isPending}
                    className="h-10"
                />
            </div>

            {/* Advanced filters (collapsible) */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleContent>
                    <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Advanced Filters</h3>
                            <div className="flex gap-2">
                                {activeFilterCount > 0 && (
                                    <>
                                        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8"
                                                >
                                                    <Save className="mr-1 h-3 w-3" />
                                                    Save Search
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Save Search</DialogTitle>
                                                    <DialogDescription>
                                                        Save your current filters for quick access later.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="searchName">Search Name</Label>
                                                        <Input
                                                            id="searchName"
                                                            value={searchName}
                                                            onChange={e => setSearchName(e.target.value)}
                                                            placeholder="e.g., Senior Engineers with React"
                                                        />
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="isPublic"
                                                            checked={isPublicSearch}
                                                            onCheckedChange={checked =>
                                                                setIsPublicSearch(checked === true)
                                                            }
                                                        />
                                                        <Label htmlFor="isPublic" className="text-sm">
                                                            Make this search available to all admins
                                                        </Label>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setSaveDialogOpen(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={handleSaveSearch}
                                                        disabled={!searchName.trim() || isSaving}
                                                    >
                                                        {isSaving && (
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        )}
                                                        Save
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearAllFilters}
                                            className="h-8 text-muted-foreground"
                                        >
                                            <RotateCcw className="mr-1 h-3 w-3" />
                                            Clear all
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Rating range */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Min Rating</Label>
                                <select
                                    name="minRating"
                                    defaultValue={defaultValues.minRating}
                                    onChange={e => updateFilter('minRating', e.target.value)}
                                    disabled={isPending}
                                    className={selectClassName}
                                >
                                    <option value="">Any</option>
                                    {[1, 2, 3, 4, 5].map(rating => (
                                        <option key={rating} value={rating}>
                                            {rating}+ stars
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Max Rating</Label>
                                <select
                                    name="maxRating"
                                    defaultValue={defaultValues.maxRating}
                                    onChange={e => updateFilter('maxRating', e.target.value)}
                                    disabled={isPending}
                                    className={selectClassName}
                                >
                                    <option value="">Any</option>
                                    {[1, 2, 3, 4, 5].map(rating => (
                                        <option key={rating} value={rating}>
                                            Up to {rating} stars
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date range */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Applied After</Label>
                                <Input
                                    type="date"
                                    name="appliedAfter"
                                    defaultValue={defaultValues.appliedAfter}
                                    onChange={e => updateFilter('appliedAfter', e.target.value)}
                                    disabled={isPending}
                                    className="h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Applied Before</Label>
                                <Input
                                    type="date"
                                    name="appliedBefore"
                                    defaultValue={defaultValues.appliedBefore}
                                    onChange={e => updateFilter('appliedBefore', e.target.value)}
                                    disabled={isPending}
                                    className="h-10"
                                />
                            </div>
                        </div>

                        {/* Has documents filter */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="hasDocuments"
                                checked={defaultValues.hasDocuments === 'true'}
                                onCheckedChange={checked =>
                                    updateFilter('hasDocuments', checked ? 'true' : '')
                                }
                            />
                            <Label htmlFor="hasDocuments" className="text-sm">
                                Has uploaded documents (CV/Resume)
                            </Label>
                        </div>

                        {/* Tags filter */}
                        {tags.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Tags</Label>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(tag => (
                                        <Badge
                                            key={tag.id}
                                            variant={
                                                defaultValues.tags.includes(tag.id)
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            className={cn(
                                                'cursor-pointer transition-colors',
                                                defaultValues.tags.includes(tag.id) && tag.color
                                                    ? `bg-[${tag.color}]`
                                                    : '',
                                            )}
                                            style={
                                                defaultValues.tags.includes(tag.id) && tag.color
                                                    ? { backgroundColor: tag.color }
                                                    : tag.color
                                                        ? { borderColor: tag.color, color: tag.color }
                                                        : undefined
                                            }
                                            onClick={() => handleTagToggle(tag.id)}
                                        >
                                            {tag.name}
                                            {defaultValues.tags.includes(tag.id) && (
                                                <X className="ml-1 h-3 w-3" />
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills filter */}
                        {skills.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Skills</Label>
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                    {skills.slice(0, 30).map(skill => (
                                        <Badge
                                            key={skill}
                                            variant={
                                                defaultValues.skills.includes(skill)
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            className="cursor-pointer transition-colors"
                                            onClick={() => handleSkillToggle(skill)}
                                        >
                                            {skill}
                                            {defaultValues.skills.includes(skill) && (
                                                <X className="ml-1 h-3 w-3" />
                                            )}
                                        </Badge>
                                    ))}
                                    {skills.length > 30 && (
                                        <span className="text-xs text-muted-foreground">
                                            +{skills.length - 30} more skills
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}
