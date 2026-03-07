'use client'

import { ArrowRight } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { candidateFields, type FieldMapping } from '@/lib/admin/validations/candidate-import'
import { cn } from '@/lib/utils'

interface FieldMapperProps {
    csvHeaders: string[]
    mapping: FieldMapping
    onMappingChange: (mapping: FieldMapping) => void
    sampleData: Record<string, string>[]
}

export function FieldMapper({
    csvHeaders,
    mapping,
    onMappingChange,
    sampleData,
}: FieldMapperProps) {
    const handleMappingChange = (csvColumn: string, candidateField: string) => {
        const newMapping = { ...mapping }

        // Remove the field from any other column that has it
        for (const col of Object.keys(newMapping)) {
            if (newMapping[col] === candidateField) {
                delete newMapping[col]
            }
        }

        if (candidateField && candidateField !== '_ignore') {
            newMapping[csvColumn] = candidateField
        } else {
            delete newMapping[csvColumn]
        }

        onMappingChange(newMapping)
    }

    const getMappedField = (csvColumn: string) => {
        return mapping[csvColumn] || ''
    }

    const isFieldMapped = (fieldKey: string) => {
        return Object.values(mapping).includes(fieldKey)
    }

    // Get preview value for a CSV column
    const getPreviewValues = (csvColumn: string) => {
        return sampleData
            .slice(0, 2)
            .map(row => row[csvColumn])
            .filter(Boolean)
    }

    return (
        <div className="space-y-4">
            {/* Required field indicator */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="destructive" className="text-xs">
                    Required
                </Badge>
                <span>Email field must be mapped</span>
            </div>

            {/* Mapping table */}
            <div className="rounded-lg border">
                <div className="grid grid-cols-12 gap-4 border-b bg-muted/50 p-3 text-sm font-medium">
                    <div className="col-span-4">CSV Column</div>
                    <div className="col-span-1 flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="col-span-4">Candidate Field</div>
                    <div className="col-span-3">Preview</div>
                </div>

                <div className="divide-y">
                    {csvHeaders.map(header => {
                        const mappedField = getMappedField(header)
                        const fieldInfo = candidateFields.find(f => f.key === mappedField)
                        const previewValues = getPreviewValues(header)

                        return (
                            <div
                                key={header}
                                className="grid grid-cols-12 gap-4 p-3 items-center"
                            >
                                <div className="col-span-4">
                                    <p className="font-medium truncate">{header}</p>
                                </div>
                                <div className="col-span-1 flex items-center justify-center">
                                    <ArrowRight
                                        className={cn(
                                            'h-4 w-4',
                                            mappedField
                                                ? 'text-primary'
                                                : 'text-muted-foreground',
                                        )}
                                    />
                                </div>
                                <div className="col-span-4">
                                    <Select
                                        value={mappedField}
                                        onValueChange={value =>
                                            handleMappingChange(header, value)
                                        }
                                    >
                                        <SelectTrigger
                                            className={cn(
                                                mappedField && fieldInfo?.required
                                                    ? 'border-primary'
                                                    : '',
                                            )}
                                        >
                                            <SelectValue placeholder="Select field..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_ignore">
                                                <span className="text-muted-foreground">
                                                    -- Ignore --
                                                </span>
                                            </SelectItem>
                                            {candidateFields.map(field => {
                                                const alreadyMapped =
                                                    isFieldMapped(field.key) &&
                                                    getMappedField(header) !== field.key

                                                return (
                                                    <SelectItem
                                                        key={field.key}
                                                        value={field.key}
                                                        disabled={alreadyMapped}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {field.label}
                                                            {field.required && (
                                                                <Badge
                                                                    variant="destructive"
                                                                    className="text-xs scale-75"
                                                                >
                                                                    Required
                                                                </Badge>
                                                            )}
                                                            {alreadyMapped && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    (mapped)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-3">
                                    {previewValues.length > 0 ? (
                                        <div className="text-xs text-muted-foreground truncate">
                                            {previewValues.join(', ')}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground/50">
                                            No data
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Validation message */}
            {!Object.values(mapping).includes('email') && (
                <p className="text-sm text-destructive">
                    Please map the Email field to continue.
                </p>
            )}
        </div>
    )
}
