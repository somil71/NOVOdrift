import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <div className={cn('skeleton', className)} style={style} />
}

export function FitCardSkeleton() {
  return (
    <div className="flex flex-col gap-xs">
      <Skeleton className="w-full" style={{ aspectRatio: '3/4' } as React.CSSProperties} />
      <Skeleton className="w-2/3 h-4" />
      <Skeleton className="w-1/3 h-3" />
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-xs">
      <Skeleton className="w-full aspect-square" />
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-1/2 h-3" />
      <Skeleton className="w-full h-9" />
    </div>
  )
}
