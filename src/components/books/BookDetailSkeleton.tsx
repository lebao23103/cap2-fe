import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * BookDetailSkeleton - Loading skeleton for book detail page
 * Matches the layout of BookDetail.tsx with shimmer animation
 */
export function BookDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="container mx-auto px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-5xl">
        {/* Back Button Skeleton */}
        <div className="flex justify-start mb-4 sm:mb-6">
          <div className="h-10 w-32 skeleton" />
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Book Cover Skeleton - Left Side */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-card rounded-lg shadow-sm border border-border/50 overflow-hidden">
              <div className="w-full aspect-[2/3] skeleton" />
              <div className="p-3 sm:p-4 space-y-2">
                <div className="h-12 skeleton" />
                <div className="flex gap-2">
                  <div className="flex-1 h-12 skeleton" />
                  <div className="flex-1 h-12 skeleton" />
                </div>
                <div className="h-10 skeleton" />
              </div>
            </div>
          </div>

          {/* Book Info Skeleton - Right Side */}
          <div className="lg:col-span-8 space-y-3 sm:space-y-4">
            {/* Title and Author */}
            <div>
              <div className="h-10 w-3/4 skeleton mb-3" />
              <div className="h-6 w-1/2 skeleton mb-4" />
              
              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-6 w-32 skeleton" />
                <div className="h-6 w-12 skeleton" />
                <div className="h-5 w-24 skeleton" />
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="h-6 w-20 rounded-full skeleton" />
              <div className="h-6 w-24 rounded-full skeleton" />
            </div>

            {/* Description */}
            <Card className="border-border/50 bg-white/50 dark:bg-card/50">
              <CardHeader className="pb-3">
                <div className="h-6 w-32 bg-muted rounded-lg animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 w-full bg-muted rounded-lg animate-pulse" />
                <div className="h-4 w-full bg-muted rounded-lg animate-pulse" />
                <div className="h-4 w-5/6 bg-muted rounded-lg animate-pulse" />
              </CardContent>
            </Card>

            {/* Book Details */}
            <Card className="border-border/50 bg-white/50 dark:bg-card/50">
              <CardHeader className="pb-3">
                <div className="h-6 w-32 bg-muted rounded-lg animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded-lg animate-pulse" />
                      <div className="h-5 w-32 bg-muted rounded-lg animate-pulse" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rating Distribution */}
            <Card className="border-border/50 bg-white/50 dark:bg-card/50">
              <CardHeader className="pb-3">
                <div className="h-6 w-40 bg-muted rounded-lg animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-4 w-16 bg-muted rounded-lg animate-pulse" />
                    <div className="flex-1 h-2 bg-muted rounded-full animate-pulse" />
                    <div className="h-4 w-12 bg-muted rounded-lg animate-pulse" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section Skeleton */}
        <Card className="border-border/50 bg-white/50 dark:bg-card/50">
          <CardHeader>
            <div className="h-7 w-48 bg-muted rounded-lg animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Review Form Skeleton */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="h-6 w-40 bg-muted rounded-lg animate-pulse" />
              <div className="h-6 w-32 bg-muted rounded-lg animate-pulse" />
              <div className="h-32 bg-muted rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
            </div>

            {/* Individual Reviews Skeleton */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-t border-border/50 pt-6 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-muted rounded-full animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-muted rounded-lg animate-pulse" />
                    <div className="h-4 w-24 bg-muted rounded-lg animate-pulse" />
                    <div className="h-4 w-full bg-muted rounded-lg animate-pulse" />
                    <div className="h-4 w-5/6 bg-muted rounded-lg animate-pulse" />
                    <div className="flex gap-2 mt-3">
                      <div className="h-8 w-20 bg-muted rounded-lg animate-pulse" />
                      <div className="h-8 w-20 bg-muted rounded-lg animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Related Books Skeleton */}
        <div className="mt-8">
          <div className="h-7 w-48 bg-muted rounded-lg animate-pulse mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="border-border/50 bg-white/50 dark:bg-card/50 overflow-hidden"
              >
                <div className="aspect-[2/3] bg-muted animate-pulse" />
                <CardHeader className="pb-2">
                  <div className="h-5 w-full bg-muted rounded-lg animate-pulse mb-2" />
                  <div className="h-4 w-2/3 bg-muted rounded-lg animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-24 bg-muted rounded-lg animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
