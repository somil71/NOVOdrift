import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'gold' | 'active'
}

export default function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'font-label-caps text-label-caps uppercase px-md py-xs rounded-full border transition-colors duration-200',
        variant === 'default' && 'bg-surface-container text-on-surface-variant border-outline-variant',
        variant === 'gold'    && 'bg-surface-container text-secondary border-secondary',
        variant === 'active'  && 'bg-surface-container-high text-secondary border-secondary',
        className
      )}
    >
      {children}
    </span>
  )
}
