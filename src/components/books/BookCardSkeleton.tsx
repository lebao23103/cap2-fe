import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for book cards while data is being fetched.
 * 
 * Features:
 * - Matches book card dimensions and layout
 * - Shimmer animation for loading indication
 * - Responsive design
 * 
 * @example
 * ```tsx
 * {isLoading && (
 *   <div className="grid grid-cols-4 gap-6">
 *     {Array.from({ length: 8 }).map((_, i) => (
 *       <BookCardSkeleton key={i} />
 *     ))}
 *   </div>
 * )}
 * ```
 */
export function BookCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl">
      {/* Cover Image Skeleton */}
      <Skeleton className="aspect-[2/3] w-full" />
      
      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-4/5" />
        
        {/* Author */}
        <Skeleton className="h-4 w-2/3" />
        
        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-4 rounded-full" />
          ))}
          <Skeleton className="h-4 w-8 ml-2" />
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
        
        {/* Stats Row */}
        <div className="flex items-center gap-4 pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </Card>
  )
}

/**
 * Grid of loading skeletons for book list.
 * 
 * @param count - Number of skeleton cards to render
 */
export function BookCardsLoadingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <BookCardSkeleton key={index} />
      ))}
    </>
  )
}
