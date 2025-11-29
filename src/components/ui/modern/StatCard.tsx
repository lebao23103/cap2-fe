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
      border: 'border-black',
      bg: 'bg-white',
      iconBg: 'bg-primary border-2 border-black',
      iconColor: 'text-black'
    },
    success: {
      border: 'border-black',
      bg: 'bg-white',
      iconBg: 'bg-green-400 border-2 border-black',
      iconColor: 'text-black'
    },
    warning: {
      border: 'border-black',
      bg: 'bg-white',
      iconBg: 'bg-amber-400 border-2 border-black',
      iconColor: 'text-black'
    },
    info: {
      border: 'border-black',
      bg: 'bg-white',
      iconBg: 'bg-blue-400 border-2 border-black',
      iconColor: 'text-black'
    }
  }

  const styles = variantStyles[variant]

  return (
    <div className={cn(
      "group relative overflow-hidden border-2 p-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 rounded-none",
      styles.border,
      styles.bg,
      className
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "flex-shrink-0 p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:scale-105 transition-all duration-300 rounded-none",
          styles.iconBg
        )}>
          <Icon className={cn("h-5 w-5", styles.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-gray-600 font-bold mb-1 font-mono">
            {label}
          </p>
          <div className="text-lg font-bold text-black font-mono">
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
