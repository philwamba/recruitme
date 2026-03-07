import { Building2, Plus, Pencil, Trash2, Globe } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EmployerPageHeader } from '@/components/employer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
    createCompanyAction,
    updateCompanyAction,
    deleteCompanyAction,
} from '@/app/actions/employer-settings'

export const dynamic = 'force-dynamic'

export default async function EmployerCompaniesPage() {
    await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    const companies = await prisma.company.findMany({
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
                title="Companies"
                description="Create and manage companies for your job postings"
            />

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Create Company Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Add Company
                        </CardTitle>
                        <CardDescription>
                            Create companies that can be assigned to job postings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={createCompanyAction} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Company Name<span className="text-destructive ml-1">*</span></Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g., Acme Corporation"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    name="website"
                                    type="url"
                                    placeholder="https://example.com"
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Company
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Companies List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Companies</CardTitle>
                        <CardDescription>{companies.length} companies available</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {companies.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Building2 className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-muted-foreground">No companies created yet.</p>
                                <p className="text-sm text-muted-foreground">Create your first company to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {companies.map(company => (
                                    <div key={company.id} className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                                                <Building2 className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{company.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{company._count.jobs} jobs</span>
                                                    {company.website && (
                                                        <>
                                                            <span>•</span>
                                                            <a
                                                                href={company.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 hover:text-primary"
                                                            >
                                                                <Globe className="h-3 w-3" />
                                                                Website
                                                            </a>
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
                                                        <span className="sr-only">Edit company</span>
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Company</DialogTitle>
                                                        <DialogDescription>
                                                            Update the company details
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <form action={updateCompanyAction} className="space-y-4">
                                                        <input type="hidden" name="id" value={company.id} />
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`edit-name-${company.id}`}>
                                                                Company Name<span className="text-destructive ml-1">*</span>
                                                            </Label>
                                                            <Input
                                                                id={`edit-name-${company.id}`}
                                                                name="name"
                                                                defaultValue={company.name}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`edit-website-${company.id}`}>Website</Label>
                                                            <Input
                                                                id={`edit-website-${company.id}`}
                                                                name="website"
                                                                type="url"
                                                                defaultValue={company.website ?? ''}
                                                                placeholder="https://example.com"
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
                                                        disabled={company._count.jobs > 0}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        <span className="sr-only">Delete company</span>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Company</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete &quot;{company.name}&quot;? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <form action={deleteCompanyAction}>
                                                            <input type="hidden" name="id" value={company.id} />
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
