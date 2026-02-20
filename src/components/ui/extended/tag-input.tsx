'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { filterSkills } from '@/lib/constants/skills'

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  maxTags?: number
  suggestions?: string[]
  disabled?: boolean
  className?: string
}

export function TagInput({
  value,
  onChange,
  placeholder = 'Add skills...',
  maxTags = 50,
  suggestions,
  disabled = false,
  className,
}: TagInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const filteredSuggestions = React.useMemo(() => {
    if (!inputValue.trim()) return []
    if (suggestions) {
      return suggestions.filter(
        (s) =>
          s.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.map((v) => v.toLowerCase()).includes(s.toLowerCase())
      )
    }
    return filterSkills(inputValue, value)
  }, [inputValue, value, suggestions])

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (
      trimmedTag &&
      !value.map((v) => v.toLowerCase()).includes(trimmedTag.toLowerCase()) &&
      value.length < maxTags
    ) {
      onChange([...value, trimmedTag])
    }
    setInputValue('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Tags display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 pr-1 text-sm font-normal"
            >
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeTag(tag)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input with autocomplete */}
      {value.length < maxTags && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Command className="overflow-visible bg-transparent">
                <CommandInput
                  ref={inputRef}
                  value={inputValue}
                  onValueChange={(val) => {
                    setInputValue(val)
                    setOpen(val.trim().length > 0)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  disabled={disabled}
                  className="border-input"
                />
              </Command>
            </div>
          </PopoverTrigger>
          {filteredSuggestions.length > 0 && (
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <Command>
                <CommandList>
                  <CommandEmpty>No suggestions found.</CommandEmpty>
                  <CommandGroup>
                    {filteredSuggestions.slice(0, 8).map((suggestion) => (
                      <CommandItem
                        key={suggestion}
                        value={suggestion}
                        onSelect={() => addTag(suggestion)}
                      >
                        {suggestion}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          )}
        </Popover>
      )}

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        {value.length}/{maxTags} skills added. Press Enter to add custom skills.
      </p>
    </div>
  )
}
