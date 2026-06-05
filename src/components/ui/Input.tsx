'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-xs">
        {label && (
          <label
            htmlFor={id}
            className="font-label-caps text-label-caps text-on-surface-variant uppercase"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-surface-container border border-outline-variant rounded px-md py-sm',
            'font-body-md text-body-md text-on-surface placeholder:text-outline',
            'focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors duration-200',
            error && 'border-error',
            className
          )}
          {...props}
        />
        {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
