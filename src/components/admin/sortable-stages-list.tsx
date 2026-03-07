'use client'

import * as React from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { GripVertical, Plus, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface StageItem {
    id: string
    name: string
    order: number
    isDefault: boolean
}

interface SortableStagesListProps {
    stages: StageItem[]
    onChange: (stages: StageItem[]) => void
    disabled?: boolean
    maxStages?: number
}

export function SortableStagesList({
    stages,
    onChange,
    disabled = false,
    maxStages = 20,
}: SortableStagesListProps) {
    const handleReorder = (reorderedStages: StageItem[]) => {
        onChange(
            reorderedStages.map((stage, index) => ({
                ...stage,
                order: index + 1,
            }))
        )
    }

    const handleAddStage = () => {
        if (stages.length >= maxStages) return
        const newStage: StageItem = {
            id: `new-${Date.now()}`,
            name: '',
            order: stages.length + 1,
            isDefault: stages.length === 0,
        }
        onChange([...stages, newStage])
    }

    const handleUpdateStage = (id: string, updates: Partial<StageItem>) => {
        onChange(
            stages.map((stage) =>
                stage.id === id ? { ...stage, ...updates } : stage
            )
        )
    }

    const handleDeleteStage = (id: string) => {
        const filtered = stages.filter((s) => s.id !== id)
        // If deleting the default stage, make the first one default
        const hasDefault = filtered.some((s) => s.isDefault)
        onChange(
            filtered.map((stage, index) => ({
                ...stage,
                order: index + 1,
                isDefault: !hasDefault && index === 0 ? true : stage.isDefault,
            }))
        )
    }

    const handleSetDefault = (id: string) => {
        onChange(
            stages.map((stage) => ({
                ...stage,
                isDefault: stage.id === id,
            }))
        )
    }

    return (
        <div className="space-y-3">
            <Reorder.Group
                axis="y"
                values={stages}
                onReorder={handleReorder}
                className="space-y-2"
            >
                {stages.map((stage) => (
                    <StageItem
                        key={stage.id}
                        stage={stage}
                        disabled={disabled}
                        canDelete={stages.length > 1}
                        onUpdate={(updates) => handleUpdateStage(stage.id, updates)}
                        onDelete={() => handleDeleteStage(stage.id)}
                        onSetDefault={() => handleSetDefault(stage.id)}
                    />
                ))}
            </Reorder.Group>

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddStage}
                disabled={disabled || stages.length >= maxStages}
                className="w-full"
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Stage
            </Button>

            {stages.length >= maxStages && (
                <p className="text-sm text-muted-foreground text-center">
                    Maximum of {maxStages} stages reached
                </p>
            )}
        </div>
    )
}

interface StageItemProps {
    stage: StageItem
    disabled: boolean
    canDelete: boolean
    onUpdate: (updates: Partial<StageItem>) => void
    onDelete: () => void
    onSetDefault: () => void
}

function StageItem({
    stage,
    disabled,
    canDelete,
    onUpdate,
    onDelete,
    onSetDefault,
}: StageItemProps) {
    const dragControls = useDragControls()

    return (
        <Reorder.Item
            value={stage}
            dragListener={false}
            dragControls={dragControls}
            className={cn(
                'flex items-center gap-2 rounded-lg border bg-card p-3',
                disabled && 'opacity-50'
            )}
        >
            <button
                type="button"
                className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
                onPointerDown={(e) => !disabled && dragControls.start(e)}
                disabled={disabled}
            >
                <GripVertical className="h-5 w-5" />
            </button>

            <span className="w-8 text-center text-sm font-medium text-muted-foreground">
                {stage.order}
            </span>

            <Input
                value={stage.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder="Stage name"
                disabled={disabled}
                className="flex-1"
            />

            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onSetDefault}
                disabled={disabled}
                title={stage.isDefault ? 'Default entry stage' : 'Set as default entry stage'}
                className={cn(
                    stage.isDefault && 'text-amber-500 hover:text-amber-600'
                )}
            >
                <Star
                    className={cn('h-4 w-4', stage.isDefault && 'fill-current')}
                />
            </Button>

            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onDelete}
                disabled={disabled || !canDelete}
                title="Remove stage"
                className="text-destructive hover:text-destructive"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </Reorder.Item>
    )
}
