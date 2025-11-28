import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { Check } from 'lucide-react'
import { useLoadingAnnouncement, useSuccessAnnouncement } from '@/hooks/useAnnounce'

interface ModernButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  isSuccess?: boolean
  loadingText?: string
  successText?: string
}

export const ModernButton = forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({
    children,
    icon: Icon,
    iconPosition = 'left',
    variant = 'ghost',
    size = 'md',
    className,
    disabled,
    isLoading,
    isSuccess,
    loadingText,
    successText,
    ...props
  }, ref) => {

    // Accessibility: Announce loading and success states
    useLoadingAnnouncement(isLoading || false, loadingText || 'Loading...')
    useSuccessAnnouncement(isSuccess || false, successText || 'Success')

    const baseStyles = "group relative overflow-hidden rounded-xl border transition-all duration-300 font-semibold inline-flex items-center justify-center gap-2"

    const variantStyles = {
      primary: "border-primary/30 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 hover:from-primary/25 hover:via-primary/20 hover:to-primary/10 text-primary dark:text-primary shadow-sm hover:shadow-md",
      secondary: "border-border/50 bg-gradient-to-r from-background via-background to-background/95 hover:from-primary/5 hover:via-primary/3 hover:to-transparent hover:border-primary/30 text-gray-900 dark:text-foreground shadow-sm hover:shadow-md",
      ghost: "border-transparent hover:bg-muted/50 hover:border-border/30 text-gray-900 dark:text-foreground",
      danger: "border-red-500/30 bg-gradient-to-r from-red-500/15 via-red-500/10 to-red-500/5 hover:from-red-500/25 hover:via-red-500/20 hover:to-red-500/10 text-red-600 dark:text-red-500 shadow-sm hover:shadow-md",
      success: "border-green-500/30 bg-gradient-to-r from-green-500/15 via-green-500/10 to-green-500/5 hover:from-green-500/25 hover:via-green-500/20 hover:to-green-500/10 text-green-600 dark:text-green-500 shadow-sm hover:shadow-md"
    }

    // Override variant to success when isSuccess is true
    const activeVariant = isSuccess ? 'success' : variant

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2.5 text-sm",
      lg: "px-5 py-2.5 text-base"
    }

    const disabledStyles = "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border/50 disabled:hover:shadow-none"

    // Display text based on state
    const displayText = isSuccess && successText ? successText : (isLoading && loadingText ? loadingText : children)

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[activeVariant],
          sizeStyles[size],
          disabledStyles,
          isSuccess && 'animate-bounce-in',
          className
        )}
        disabled={disabled || isLoading || isSuccess}
        {...props}
      >
        {isLoading && (
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {isSuccess && (
          <Check className="h-4 w-4 animate-scale-in" />
        )}
        {!isLoading && !isSuccess && Icon && iconPosition === 'left' && (
          <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
        )}
        <span className={cn('transition-opacity', (isLoading || isSuccess) && 'opacity-90')}>
          {displayText}
        </span>
        {!isLoading && !isSuccess && Icon && iconPosition === 'right' && (
          <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
        )}
      </button>
    )
  }
)

ModernButton.displayName = 'ModernButton'
