import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  icon?: LucideIcon
  badge?: string | number
  action?: ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'info'
  className?: string
}

export const SectionHeader = ({
  title,
  icon: Icon,
  badge,
  action,
  variant = 'primary',
  className
}: SectionHeaderProps) => {
  
  const variantColors = {
    primary: {
      accent: 'bg-primary/30',
      icon: 'text-primary',
      badge: 'from-primary/20 to-primary/10 text-primary border-primary/20'
    },
    success: {
      accent: 'bg-green-500/30',
      icon: 'text-green-600 dark:text-green-500',
      badge: 'from-green-500/20 to-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
    },
    warning: {
      accent: 'bg-amber-500/30',
      icon: 'text-amber-600 dark:text-amber-500',
      badge: 'from-amber-500/20 to-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
    },
    info: {
      accent: 'bg-blue-500/30',
      icon: 'text-blue-600 dark:text-blue-500',
      badge: 'from-blue-500/20 to-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
    }
  }
  
  const colors = variantColors[variant]
  
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-2">
        <div className={cn("h-1 w-8 rounded-full", colors.accent)} />
        {Icon && <Icon className={cn("h-4 w-4", colors.icon)} />}
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        {badge !== undefined && (
          <span className={cn(
            "ml-1 px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r rounded-full border",
            colors.badge
          )}>
            {badge}
          </span>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
