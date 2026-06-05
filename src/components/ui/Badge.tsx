import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'gold'
}

export default function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'text-xs font-medium px-2 py-0.5 rounded-full border',
        variant === 'default' && 'bg-bg-surface text-text-muted border-border',
        variant === 'gold' && 'bg-accent-gold/10 text-accent-gold border-accent-gold/30',
        className
      )}
    >
      {children}
    </span>
  )
}
