'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-label-caps text-label-caps uppercase tracking-wider rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-secondary text-on-secondary hover:bg-secondary-fixed hover:shadow-[0_0_15px_rgba(233,193,105,0.3)]':
              variant === 'primary',
            'bg-transparent text-secondary border border-outline-variant hover:border-secondary':
              variant === 'ghost',
            'bg-error-container text-on-error-container hover:opacity-90':
              variant === 'danger',
            'px-md py-xs text-[11px]': size === 'sm',
            'px-lg py-sm':             size === 'md',
            'px-xl py-md':             size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-xs">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
