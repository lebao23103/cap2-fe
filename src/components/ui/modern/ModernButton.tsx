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

    const baseStyles = "group relative overflow-hidden rounded-none border-2 transition-all duration-300 font-bold inline-flex items-center justify-center gap-2 uppercase tracking-wide"

    const variantStyles = {
      primary: "border-border bg-primary text-primary-foreground shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover active:translate-x-[0px] active:translate-y-[0px] active:shadow-neo",
      secondary: "border-border bg-card text-card-foreground shadow-neo hover:bg-muted hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover active:translate-x-[0px] active:translate-y-[0px] active:shadow-neo",
      ghost: "border-transparent hover:bg-primary/20 text-foreground",
      danger: "border-border bg-destructive text-destructive-foreground shadow-neo hover:bg-destructive/90 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover",
      success: "border-border bg-green-500 text-black shadow-neo hover:bg-green-600 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover"
    }

    // Override variant to success when isSuccess is true
    const activeVariant = isSuccess ? 'success' : variant

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs border-2",
      md: "px-6 py-3 text-sm border-2",
      lg: "px-8 py-4 text-base border-2"
    }

    const disabledStyles = "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-neo"

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
          className
        )}
        disabled={disabled || isLoading || isSuccess}
        {...props}
      >
        {isLoading && (
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {isSuccess && (
          <Check className="h-5 w-5 animate-scale-in mr-2" />
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
