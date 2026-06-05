'use client'

import { Search } from 'lucide-react'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Search...', className }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      className={cn(
        'flex items-center gap-3 bg-bg-surface border border-border rounded-card px-4 py-3',
        'focus-within:border-accent-gold transition-colors duration-200',
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      <Search size={18} className="text-text-muted flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted text-sm focus:outline-none"
      />
    </div>
  )
}
