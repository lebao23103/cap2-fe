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
      border: 'border-border',
      bg: 'bg-card',
      iconBg: 'bg-primary border-2 border-border',
      iconColor: 'text-primary-foreground'
    },
    success: {
      border: 'border-border',
      bg: 'bg-card',
      iconBg: 'bg-green-400 border-2 border-border',
      iconColor: 'text-black'
    },
    warning: {
      border: 'border-border',
      bg: 'bg-card',
      iconBg: 'bg-amber-400 border-2 border-border',
      iconColor: 'text-black'
    },
    info: {
      border: 'border-border',
      bg: 'bg-card',
      iconBg: 'bg-blue-400 border-2 border-border',
      iconColor: 'text-black'
    }
  }

  const styles = variantStyles[variant]

  return (
    <div className={cn(
      "group relative overflow-hidden border-2 p-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover shadow-neo transition-all duration-300 rounded-lg",
      styles.border,
      styles.bg,
      className
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "flex-shrink-0 p-3 shadow-neo-sm group-hover:scale-105 transition-all duration-300 rounded-lg",
          styles.iconBg
        )}>
          <Icon className={cn("h-5 w-5", styles.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1 font-mono">
            {label}
          </p>
          <div className="text-lg font-bold text-foreground font-mono">
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
