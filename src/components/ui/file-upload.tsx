'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { FileText, Upload, X, FileUp, AlertCircle } from 'lucide-react'
import { Button } from './button'

interface FileUploadProps {
    id?: string
    name?: string
    accept?: string
    multiple?: boolean
    maxSize?: number // in bytes
    disabled?: boolean
    required?: boolean
    value?: File | File[] | null
    onChange?: (files: File | File[] | null) => void
    onFilesSelected?: (files: FileList) => void
    className?: string
    label?: string
    description?: string
    error?: string
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function getFileIcon(file: File) {
    const type = file.type
    if (type.includes('pdf')) {
        return <FileText className="h-8 w-8 text-red-500" />
    }
    if (type.includes('word') || type.includes('document')) {
        return <FileText className="h-8 w-8 text-blue-500" />
    }
    if (type.includes('image')) {
        return <FileText className="h-8 w-8 text-green-500" />
    }
    return <FileText className="h-8 w-8 text-muted-foreground" />
}

function FileUpload({
    id,
    name,
    accept = '.pdf,.doc,.docx',
    multiple = false,
    maxSize = 5 * 1024 * 1024, // 5MB default
    disabled = false,
    required = false,
    value,
    onChange,
    onFilesSelected,
    className,
    label,
    description,
    error,
}: FileUploadProps) {
    const [isDragging, setIsDragging] = React.useState(false)
    const [internalFiles, setInternalFiles] = React.useState<File[]>([])
    const [validationError, setValidationError] = React.useState<string | null>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const files = React.useMemo(() => {
        if (value) {
            return Array.isArray(value) ? value : [value]
        }
        return internalFiles
    }, [value, internalFiles])

    const acceptedTypes = React.useMemo(() => {
        return accept.split(',').map(t => t.trim().toLowerCase())
    }, [accept])

    function validateFile(file: File): string | null {
        // Check file size
        if (file.size > maxSize) {
            return `File "${file.name}" exceeds maximum size of ${formatFileSize(maxSize)}`
        }

        // Check file type
        const extension = `.${file.name.split('.').pop()?.toLowerCase()}`
        const mimeType = file.type.toLowerCase()

        const isValidType = acceptedTypes.some(accepted => {
            if (accepted.startsWith('.')) {
                return extension === accepted
            }
            if (accepted.includes('*')) {
                const [type] = accepted.split('/')
                return mimeType.startsWith(type)
            }
            return mimeType === accepted
        })

        if (!isValidType) {
            return `File "${file.name}" is not a supported format`
        }

        return null
    }

    function handleFiles(fileList: FileList | null) {
        if (!fileList || fileList.length === 0) return

        setValidationError(null)
        const newFiles: File[] = []

        for (const file of Array.from(fileList)) {
            const error = validateFile(file)
            if (error) {
                setValidationError(error)
                return
            }
            newFiles.push(file)
        }

        if (onFilesSelected) {
            onFilesSelected(fileList)
        }

        if (onChange) {
            if (multiple) {
                onChange([...files, ...newFiles])
            } else {
                onChange(newFiles[0] || null)
            }
        } else {
            if (multiple) {
                setInternalFiles(prev => [...prev, ...newFiles])
            } else {
                setInternalFiles(newFiles.slice(0, 1))
            }
        }
    }

    function removeFile(index: number) {
        const newFiles = files.filter((_, i) => i !== index)
        if (onChange) {
            onChange(multiple ? newFiles : newFiles[0] || null)
        } else {
            setInternalFiles(newFiles)
        }
        setValidationError(null)
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault()
        e.stopPropagation()
        if (!disabled) {
            setIsDragging(true)
        }
    }

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (disabled) return
        handleFiles(e.dataTransfer.files)
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        handleFiles(e.target.files)
        // Reset input so the same file can be selected again
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }

    function handleClick() {
        if (!disabled) {
            inputRef.current?.click()
        }
    }

    const displayError = error || validationError
    const hasFiles = files.length > 0

    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </label>
            )}

            <input
                ref={inputRef}
                id={id}
                name={name}
                type="file"
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                required={required && files.length === 0}
                onChange={handleInputChange}
                className="sr-only"
            />

            {/* Drop Zone */}
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all cursor-pointer',
                    'hover:border-primary/50 hover:bg-muted/50',
                    isDragging && 'border-primary bg-primary/5 scale-[1.02]',
                    hasFiles && 'border-primary/30 bg-primary/5',
                    displayError && 'border-destructive/50 bg-destructive/5',
                    disabled && 'cursor-not-allowed opacity-50 hover:border-muted-foreground/25 hover:bg-transparent',
                    !isDragging && !hasFiles && !displayError && 'border-muted-foreground/25'
                )}
            >
                {hasFiles ? (
                    <div className="w-full space-y-3">
                        {files.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="flex items-center gap-3 rounded-md border bg-background p-3"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {getFileIcon(file)}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    onClick={() => removeFile(index)}
                                    disabled={disabled}
                                >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Remove file</span>
                                </Button>
                            </div>
                        ))}
                        {multiple && (
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleClick()
                                }}
                            >
                                <Upload className="h-4 w-4" />
                                Add more files
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center">
                        <div className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-full mb-3',
                            isDragging ? 'bg-primary/10' : 'bg-muted'
                        )}>
                            <FileUp className={cn(
                                'h-6 w-6',
                                isDragging ? 'text-primary' : 'text-muted-foreground'
                            )} />
                        </div>
                        <p className="text-sm font-medium">
                            {isDragging ? 'Drop files here' : 'Drag and drop files here'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            or <span className="text-primary font-medium">browse</span> to select
                        </p>
                    </div>
                )}
            </div>

            {/* Description or Error */}
            {(description || displayError) && (
                <div className={cn(
                    'flex items-start gap-2 text-xs',
                    displayError ? 'text-destructive' : 'text-muted-foreground'
                )}>
                    {displayError && <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
                    <p>{displayError || description}</p>
                </div>
            )}
        </div>
    )
}

export { FileUpload }
export type { FileUploadProps }
