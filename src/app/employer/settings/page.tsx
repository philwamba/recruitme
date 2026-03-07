import { Building2, MapPin, Briefcase, Plus, Pencil, Trash2 } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EmployerPageHeader } from '@/components/employer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    createDepartmentAction,
    updateDepartmentAction,
    deleteDepartmentAction,
} from '@/app/actions/employer-settings'

export const dynamic = 'force-dynamic'

export default async function EmployerSettingsPage() {
    const user = await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    // Get departments
    const departments = await prisma.department.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { jobs: true },
            },
        },
    })

    // Get distinct companies and locations from user's jobs
    const jobs = await prisma.job.findMany({
        where: {
            createdByUserId: user.id,
        },
        select: {
            company: true,
            location: true,
        },
    })

    const companies = [...new Set(jobs.map(j => j.company).filter(Boolean))]
    const locations = [...new Set(jobs.map(j => j.location).filter(Boolean))] as string[]

    return (
        <div className="space-y-6">
            <EmployerPageHeader
                title="Settings"
                description="Manage your recruitment settings, companies, locations, and departments"
            />

            <Tabs defaultValue="departments" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="departments">Departments</TabsTrigger>
                    <TabsTrigger value="companies">Companies</TabsTrigger>
                    <TabsTrigger value="locations">Locations</TabsTrigger>
                </TabsList>

                <TabsContent value="departments" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Create Department Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    Add Department
                                </CardTitle>
                                <CardDescription>
                                    Create departments that can be assigned to job postings
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form action={createDepartmentAction} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Department Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="e.g., Engineering, Marketing, Sales"
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Department
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Departments List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Departments</CardTitle>
                                <CardDescription>{departments.length} departments available</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {departments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <Briefcase className="h-12 w-12 text-muted-foreground mb-3" />
                                        <p className="text-muted-foreground">No departments created yet.</p>
                                        <p className="text-sm text-muted-foreground">Create your first department to get started.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {departments.map(department => (
                                            <div key={department.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                                                        <Briefcase className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{department.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {department._count.jobs} jobs
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {/* Edit Dialog */}
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <Pencil className="h-3.5 w-3.5" />
                                                                <span className="sr-only">Edit department</span>
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Edit Department</DialogTitle>
                                                                <DialogDescription>
                                                                    Update the department name
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <form action={updateDepartmentAction} className="space-y-4">
                                                                <input type="hidden" name="id" value={department.id} />
                                                                <div className="space-y-2">
                                                                    <Label htmlFor={`edit-name-${department.id}`}>Department Name</Label>
                                                                    <Input
                                                                        id={`edit-name-${department.id}`}
                                                                        name="name"
                                                                        defaultValue={department.name}
                                                                        required
                                                                    />
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
                                                                disabled={department._count.jobs > 0}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                <span className="sr-only">Delete department</span>
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Department</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete &quot;{department.name}&quot;? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <form action={deleteDepartmentAction}>
                                                                    <input type="hidden" name="id" value={department.id} />
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
                </TabsContent>

                <TabsContent value="companies" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Your Companies
                            </CardTitle>
                            <CardDescription>
                                Companies are automatically saved when you create jobs. These will appear as options in the job creation form.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {companies.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Building2 className="h-12 w-12 text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground">No companies yet.</p>
                                    <p className="text-sm text-muted-foreground">Create a job to add your first company.</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {companies.map(company => (
                                        <Badge key={company} variant="secondary" className="text-sm">
                                            <Building2 className="mr-1.5 h-3 w-3" />
                                            {company}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="locations" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Your Locations
                            </CardTitle>
                            <CardDescription>
                                Locations are automatically saved when you create jobs. These will appear as options in the job creation form.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {locations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <MapPin className="h-12 w-12 text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground">No locations yet.</p>
                                    <p className="text-sm text-muted-foreground">Create a job to add your first location.</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {locations.map(location => (
                                        <Badge key={location} variant="secondary" className="text-sm">
                                            <MapPin className="mr-1.5 h-3 w-3" />
                                            {location}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
