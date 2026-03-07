'use client'

import * as React from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
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
import { Input } from '@/components/ui/input'

export type Country = {
    code: string
    name: string
    dialCode: string
    flag: string
}

const countries: Country[] = [
    { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '\u{1F1F9}\u{1F1FF}' },
    { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '\u{1F1F0}\u{1F1EA}' },
    { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '\u{1F1FA}\u{1F1EC}' },
]

interface PhoneInputProps {
    value?: string
    onChange?: (value: string) => void
    defaultCountry?: string
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function PhoneInput({
    value = '',
    onChange,
    defaultCountry = 'TZ',
    placeholder = '712 345 678',
    className,
    disabled,
}: PhoneInputProps) {
    const [open, setOpen] = React.useState(false)
    const [selectedCountry, setSelectedCountry] = React.useState<Country>(
        () => countries.find(c => c.code === defaultCountry) || countries[0]
    )

    // Parse initial value to extract country code
    React.useEffect(() => {
        if (value) {
            const matchedCountry = countries.find(c =>
                value.startsWith(c.dialCode)
            )
            if (matchedCountry && matchedCountry.code !== selectedCountry.code) {
                setSelectedCountry(matchedCountry)
            }
        }
    }, []) // Only run on mount

    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country)
        setOpen(false)
        // Update the value with new country code
        const phoneWithoutCode = value.replace(/^\+\d+\s*/, '')
        if (onChange) {
            onChange(phoneWithoutCode ? `${country.dialCode} ${phoneWithoutCode}` : '')
        }
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value
        // Remove any leading + or dial codes the user might type
        const cleanedInput = inputValue.replace(/^\+\d+\s*/, '')
        if (onChange) {
            onChange(cleanedInput ? `${selectedCountry.dialCode} ${cleanedInput}` : '')
        }
    }

    // Extract the phone number without country code for display
    const displayValue = value.replace(/^\+\d+\s*/, '')

    return (
        <div className={cn('flex', className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className="h-11 w-[100px] shrink-0 justify-between rounded-r-none border-r-0 px-3 font-normal"
                    >
                        <span className="flex items-center gap-1.5">
                            <span className="text-base">{selectedCountry.flag}</span>
                            <span className="text-sm text-muted-foreground">{selectedCountry.dialCode}</span>
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                                {countries.map((country) => (
                                    <CommandItem
                                        key={country.code}
                                        value={`${country.name} ${country.dialCode}`}
                                        onSelect={() => handleCountrySelect(country)}
                                    >
                                        <span className="text-base">{country.flag}</span>
                                        <span className="flex-1">{country.name}</span>
                                        <span className="text-sm text-muted-foreground">{country.dialCode}</span>
                                        {selectedCountry.code === country.code && (
                                            <Check className="h-4 w-4 text-primary" />
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <Input
                type="tel"
                value={displayValue}
                onChange={handlePhoneChange}
                placeholder={placeholder}
                disabled={disabled}
                className="h-11 rounded-l-none"
            />
        </div>
    )
}

export { countries }
