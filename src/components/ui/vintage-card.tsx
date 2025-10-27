import * as React from 'react'
import { cn } from '@/lib/utils'

interface VintageCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'paper' | 'leather' | 'aged' | 'manuscript'
  texture?: boolean
  ornate?: boolean
  hoverable?: boolean
}

const VintageCard = React.forwardRef<HTMLDivElement, VintageCardProps>(
  ({ className, variant = 'paper', texture = true, ornate = false, hoverable = true, children, ...props }, ref) => {
    const baseStyles = cn(
      'relative rounded-sm overflow-hidden transition-all duration-500',
      'shadow-md',
      texture && 'before:absolute before:inset-0 before:opacity-20 before:mix-blend-multiply before:pointer-events-none'
    )

    const variants = {
      paper: cn(
        'bg-parchment-100 dark:bg-ink-900',
        'border-2 border-parchment-300 dark:border-ink-700',
        texture && 'before:bg-paper-texture'
      ),
      leather: cn(
        'bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900',
        'border-4 border-amber-950',
        'shadow-xl'
      ),
      aged: cn(
        'bg-gradient-to-br from-parchment-200 via-parchment-100 to-parchment-200',
        'dark:from-ink-800 dark:via-ink-900 dark:to-ink-800',
        'border border-parchment-400 dark:border-ink-600',
        'shadow-inner'
      ),
      manuscript: cn(
        'bg-parchment-50 dark:bg-ink-950',
        'border-8 border-double border-gold-leaf-600 dark:border-gold-leaf-700',
        'p-8'
      )
    }

    const hoverStyles = hoverable && cn(
      'hover:shadow-xl hover:-translate-y-1',
      'hover:border-gold-leaf-500 dark:hover:border-gold-leaf-600'
    )

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], hoverStyles, className)}
        {...props}
      >
        {ornate && (
          <>
            <div className='absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-gold-leaf-600 dark:border-gold-leaf-500' />
            <div className='absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-gold-leaf-600 dark:border-gold-leaf-500' />
            <div className='absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-gold-leaf-600 dark:border-gold-leaf-500' />
            <div className='absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-gold-leaf-600 dark:border-gold-leaf-500' />
          </>
        )}
        <div className='relative z-10'>{children}</div>
      </div>
    )
  }
)
VintageCard.displayName = 'VintageCard'

const VintageCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6 border-b border-parchment-300 dark:border-ink-700', className)}
    {...props}
  />
))
VintageCardHeader.displayName = 'VintageCardHeader'

const VintageCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'font-display text-2xl font-bold tracking-wide',
      'text-ink-900 dark:text-parchment-100',
      'mb-2',
      className
    )}
    {...props}
  >
    {children}
  </h3>
))
VintageCardTitle.displayName = 'VintageCardTitle'

const VintageCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 font-body', className)} {...props} />
))
VintageCardContent.displayName = 'VintageCardContent'

export { VintageCard, VintageCardHeader, VintageCardTitle, VintageCardContent }