import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number | ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'info'
  children?: ReactNode
  className?: string
}

export const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  variant = 'primary',
  children,
  className 
}: StatCardProps) => {
  
  const variantStyles = {
    primary: {
      border: 'border-primary/10 hover:border-primary/20',
      bg: 'bg-gradient-to-br from-primary/5 via-primary/3 to-transparent',
      iconBg: 'bg-gradient-to-br from-primary/20 to-primary/10',
      iconColor: 'text-primary'
    },
    success: {
      border: 'border-green-500/10 hover:border-green-500/20',
      bg: 'bg-gradient-to-br from-green-500/5 via-green-500/3 to-transparent',
      iconBg: 'bg-gradient-to-br from-green-500/20 to-green-500/10',
      iconColor: 'text-green-600 dark:text-green-500'
    },
    warning: {
      border: 'border-amber-500/10 hover:border-amber-500/20',
      bg: 'bg-gradient-to-br from-amber-500/5 via-amber-500/3 to-transparent',
      iconBg: 'bg-gradient-to-br from-amber-500/20 to-amber-500/10',
      iconColor: 'text-amber-600 dark:text-amber-500'
    },
    info: {
      border: 'border-blue-500/10 hover:border-blue-500/20',
      bg: 'bg-gradient-to-br from-blue-500/5 via-blue-500/3 to-transparent',
      iconBg: 'bg-gradient-to-br from-blue-500/20 to-blue-500/10',
      iconColor: 'text-blue-600 dark:text-blue-500'
    }
  }
  
  const styles = variantStyles[variant]
  
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl border p-4 hover:shadow-md transition-all duration-300",
      styles.border,
      styles.bg,
      className
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "flex-shrink-0 p-3 rounded-xl shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300",
          styles.iconBg
        )}>
          <Icon className={cn("h-5 w-5", styles.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            {label}
          </p>
          <div className="text-lg font-bold text-foreground">
            {value}
          </div>
        </div>
      </div>
      {children && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  )
}
