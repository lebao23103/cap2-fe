import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-muted/50',
        className
      )}
      {...props}
    />
  );
}

// Specific skeleton variants for common use cases

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border/50 bg-card p-6', className)}>
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}

function BookCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border/50 bg-card overflow-hidden', className)}>
      <Skeleton className="h-64 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 p-4 rounded-lg border border-border/50', className)}>
      <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-9 w-24" />
    </div>
  );
}

function TableSkeleton({ rows = 5, columns = 4, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={cn('rounded-lg border border-border/50 overflow-hidden', className)}>
      {/* Table Header */}
      <div className="bg-muted/30 border-b border-border/50 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-5 flex-1" />
          ))}
        </div>
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-border/30">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="p-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-5 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border/50 bg-card p-6', className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

function ProfileHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border/50 bg-card overflow-hidden', className)}>
      {/* Cover Image */}
      <Skeleton className="h-32 w-full" />
      {/* Profile Info */}
      <div className="p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <Skeleton className="h-24 w-24 rounded-full -mt-12 ring-4 ring-background" />
          <div className="flex-1 space-y-3 pt-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormSkeleton({ fields = 4, className }: { fields?: number; className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export {
  Skeleton,
  CardSkeleton,
  BookCardSkeleton,
  ListItemSkeleton,
  TableSkeleton,
  TextSkeleton,
  StatCardSkeleton,
  ProfileHeaderSkeleton,
  FormSkeleton,
};
