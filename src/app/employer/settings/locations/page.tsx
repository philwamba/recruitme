import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EmployerPageHeader } from '@/components/employer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
    createLocationAction,
    updateLocationAction,
    deleteLocationAction,
} from '@/app/actions/employer-settings'

export const dynamic = 'force-dynamic'

export default async function EmployerLocationsPage() {
    await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    const locations = await prisma.location.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { jobs: true },
            },
        },
    })

    return (
        <div className="space-y-6">
            <EmployerPageHeader
                title="Locations"
                description="Create and manage locations for your job postings"
            />

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Create Location Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Add Location
                        </CardTitle>
                        <CardDescription>
                            Create locations that can be assigned to job postings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={createLocationAction} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Location Name<span className="text-destructive ml-1">*</span></Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g., New York Office, Remote - USA"
                                    required
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        placeholder="e.g., New York"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        name="country"
                                        placeholder="e.g., United States"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Location
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Locations List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Locations</CardTitle>
                        <CardDescription>{locations.length} locations available</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {locations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <MapPin className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-muted-foreground">No locations created yet.</p>
                                <p className="text-sm text-muted-foreground">Create your first location to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {locations.map(location => (
                                    <div key={location.id} className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                                                <MapPin className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{location.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{location._count.jobs} jobs</span>
                                                    {(location.city || location.country) && (
                                                        <>
                                                            <span>•</span>
                                                            <span>
                                                                {[location.city, location.country].filter(Boolean).join(', ')}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {/* Edit Dialog */}
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        <span className="sr-only">Edit location</span>
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Location</DialogTitle>
                                                        <DialogDescription>
                                                            Update the location details
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <form action={updateLocationAction} className="space-y-4">
                                                        <input type="hidden" name="id" value={location.id} />
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`edit-name-${location.id}`}>
                                                                Location Name<span className="text-destructive ml-1">*</span>
                                                            </Label>
                                                            <Input
                                                                id={`edit-name-${location.id}`}
                                                                name="name"
                                                                defaultValue={location.name}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="grid gap-4 sm:grid-cols-2">
                                                            <div className="space-y-2">
                                                                <Label htmlFor={`edit-city-${location.id}`}>City</Label>
                                                                <Input
                                                                    id={`edit-city-${location.id}`}
                                                                    name="city"
                                                                    defaultValue={location.city ?? ''}
                                                                    placeholder="e.g., New York"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor={`edit-country-${location.id}`}>Country</Label>
                                                                <Input
                                                                    id={`edit-country-${location.id}`}
                                                                    name="country"
                                                                    defaultValue={location.country ?? ''}
                                                                    placeholder="e.g., United States"
                                                                />
                                                            </div>
                                                        </div>
                                                        <Button type="submit" className="w-full">
                                                            Save Changes
                                                        </Button>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>

                                            {/* Delete Dialog */}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        disabled={location._count.jobs > 0}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        <span className="sr-only">Delete location</span>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Location</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete &quot;{location.name}&quot;? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <form action={deleteLocationAction}>
                                                            <input type="hidden" name="id" value={location.id} />
                                                            <AlertDialogAction type="submit" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                Delete
                                                            </AlertDialogAction>
                                                        </form>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
