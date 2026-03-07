'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft,
    ArrowRight,
    Check,
    FileSpreadsheet,
    Loader2,
    Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { candidateFields, type FieldMapping } from '@/lib/admin/validations/candidate-import'
import { processImport, createCandidateImport } from '@/lib/admin/actions/candidate-imports'
import { FieldMapper } from './field-mapper'

interface Job {
    id: string
    title: string
    company: string
}

interface ImportWizardProps {
    jobs: Job[]
}

type Step = 'upload' | 'map' | 'configure' | 'process' | 'complete'

interface ParsedCSV {
    headers: string[]
    rows: Record<string, string>[]
}

export function ImportWizard({ jobs }: ImportWizardProps) {
    const router = useRouter()
    const [step, setStep] = useState<Step>('upload')
    const [file, setFile] = useState<File | null>(null)
    const [parsedData, setParsedData] = useState<ParsedCSV | null>(null)
    const [fieldMapping, setFieldMapping] = useState<FieldMapping>({})
    const [selectedJobId, setSelectedJobId] = useState<string>('')
    const [skipDuplicates, setSkipDuplicates] = useState(true)
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState<{
        status: string
        successCount: number
        errorCount: number
        errors: Array<{ row: number; field: string; message: string }>
    } | null>(null)

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        setFile(selectedFile)

        // Parse CSV
        const text = await selectedFile.text()
        const lines = text.split('\n').filter(line => line.trim())
        if (lines.length < 2) {
            alert('CSV file must have at least a header row and one data row')
            return
        }

        const headers = parseCSVLine(lines[0])
        const rows: Record<string, string>[] = []

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i])
            const row: Record<string, string> = {}
            headers.forEach((header, index) => {
                row[header] = values[index] || ''
            })
            rows.push(row)
        }

        setParsedData({ headers, rows })

        // Auto-map fields based on header names
        const autoMapping: FieldMapping = {}
        headers.forEach(header => {
            const normalizedHeader = header.toLowerCase().replace(/[^a-z]/g, '')
            const matchingField = candidateFields.find(field => {
                const normalizedField = field.key.toLowerCase()
                const normalizedLabel = field.label.toLowerCase().replace(/[^a-z]/g, '')
                return (
                    normalizedHeader === normalizedField ||
                    normalizedHeader === normalizedLabel ||
                    normalizedHeader.includes(normalizedField) ||
                    normalizedField.includes(normalizedHeader)
                )
            })
            if (matchingField) {
                autoMapping[header] = matchingField.key
            }
        })
        setFieldMapping(autoMapping)

        setStep('map')
    }, [])

    const handleProcess = async () => {
        if (!parsedData || !file) return

        setStep('process')

        try {
            // Create import record
            const createResult = await createCandidateImport({
                fileName: file.name,
                storageKey: `imports/${Date.now()}-${file.name}`,
                totalRows: parsedData.rows.length,
                fieldMapping,
                jobId: selectedJobId || undefined,
            })

            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 5, 90))
            }, 200)

            // Process import
            const processResult = await processImport({
                importId: createResult.id,
                rows: parsedData.rows,
                fieldMapping,
                skipDuplicates,
                jobId: selectedJobId || undefined,
            })

            clearInterval(progressInterval)
            setProgress(100)
            setResult(processResult)
            setStep('complete')
        } catch (error) {
            console.error('Import failed:', error)
            alert('Import failed. Please try again.')
        }
    }

    const steps: { key: Step; label: string }[] = [
        { key: 'upload', label: 'Upload' },
        { key: 'map', label: 'Map Fields' },
        { key: 'configure', label: 'Configure' },
        { key: 'process', label: 'Process' },
        { key: 'complete', label: 'Complete' },
    ]

    const currentStepIndex = steps.findIndex(s => s.key === step)

    return (
        <div className="space-y-6">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2">
                {steps.map((s, index) => (
                    <div key={s.key} className="flex items-center">
                        <div
                            className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                                index <= currentStepIndex
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground',
                            )}
                        >
                            {index < currentStepIndex ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                index + 1
                            )}
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    'mx-2 h-0.5 w-8',
                                    index < currentStepIndex ? 'bg-primary' : 'bg-muted',
                                )}
                            />
                        )}
                    </div>
                ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
                {steps[currentStepIndex]?.label}
            </p>

            {/* Step content */}
            {step === 'upload' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Upload CSV File</CardTitle>
                        <CardDescription>
                            Select a CSV file containing candidate information.
                            The first row should contain column headers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <label
                            htmlFor="csv-upload"
                            className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 cursor-pointer hover:border-primary transition-colors"
                        >
                            <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                            <div className="text-center">
                                <p className="font-medium">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    CSV files only
                                </p>
                            </div>
                            <input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </label>
                    </CardContent>
                </Card>
            )}

            {step === 'map' && parsedData && (
                <Card>
                    <CardHeader>
                        <CardTitle>Map CSV Columns</CardTitle>
                        <CardDescription>
                            Match your CSV columns to candidate fields.
                            We&apos;ve auto-mapped some fields based on column names.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FieldMapper
                            csvHeaders={parsedData.headers}
                            mapping={fieldMapping}
                            onMappingChange={setFieldMapping}
                            sampleData={parsedData.rows.slice(0, 3)}
                        />
                        <div className="mt-6 flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setStep('upload')}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <Button
                                onClick={() => setStep('configure')}
                                disabled={!fieldMapping.email}
                            >
                                Next
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 'configure' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Import Configuration</CardTitle>
                        <CardDescription>
                            Configure how candidates should be imported.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Associate with Job (Optional)</Label>
                            <Select
                                value={selectedJobId}
                                onValueChange={setSelectedJobId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="No job selected" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">No job</SelectItem>
                                    {jobs.map(job => (
                                        <SelectItem key={job.id} value={job.id}>
                                            {job.title} - {job.company}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                If selected, applications will be created for this job.
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="skipDuplicates"
                                checked={skipDuplicates}
                                onCheckedChange={checked =>
                                    setSkipDuplicates(checked === true)
                                }
                            />
                            <Label htmlFor="skipDuplicates">
                                Skip duplicate email addresses
                            </Label>
                        </div>

                        <div className="rounded-lg bg-muted p-4">
                            <p className="text-sm font-medium">Import Summary</p>
                            <ul className="mt-2 text-sm text-muted-foreground">
                                <li>Total rows: {parsedData?.rows.length}</li>
                                <li>
                                    Mapped fields:{' '}
                                    {Object.values(fieldMapping).filter(Boolean).length}
                                </li>
                                {selectedJobId && (
                                    <li>
                                        Job:{' '}
                                        {jobs.find(j => j.id === selectedJobId)?.title}
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setStep('map')}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <Button onClick={handleProcess}>
                                <Upload className="mr-2 h-4 w-4" />
                                Start Import
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 'process' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Processing Import</CardTitle>
                        <CardDescription>
                            Please wait while we process your file...
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                        <Progress value={progress} className="w-full" />
                        <p className="text-center text-sm text-muted-foreground">
                            {progress}% complete
                        </p>
                    </CardContent>
                </Card>
            )}

            {step === 'complete' && result && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {result.status === 'COMPLETED'
                                ? 'Import Complete!'
                                : result.status === 'PARTIAL'
                                    ? 'Import Partially Complete'
                                    : 'Import Failed'}
                        </CardTitle>
                        <CardDescription>
                            {result.status === 'COMPLETED'
                                ? 'All candidates were imported successfully.'
                                : result.status === 'PARTIAL'
                                    ? 'Some candidates could not be imported.'
                                    : 'The import encountered errors.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {result.successCount}
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    Imported
                                </p>
                            </div>
                            <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-950">
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {result.errorCount}
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    Errors
                                </p>
                            </div>
                        </div>

                        {result.errors.length > 0 && (
                            <div className="rounded-lg border p-4">
                                <p className="font-medium mb-2">Errors</p>
                                <div className="max-h-48 overflow-y-auto space-y-1 text-sm">
                                    {result.errors.map((error, i) => (
                                        <p key={i} className="text-muted-foreground">
                                            Row {error.row}: {error.field} - {error.message}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setStep('upload')
                                    setFile(null)
                                    setParsedData(null)
                                    setFieldMapping({})
                                    setResult(null)
                                    setProgress(0)
                                }}
                            >
                                Import More
                            </Button>
                            <Button onClick={() => router.push('/admin/candidates')}>
                                View Candidates
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

// Helper function to parse CSV line (handles quoted values)
function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
            inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim())
            current = ''
        } else {
            current += char
        }
    }

    result.push(current.trim())
    return result
}
