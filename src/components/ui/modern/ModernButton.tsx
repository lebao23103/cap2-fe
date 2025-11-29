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
      primary: "border-black bg-primary text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
      secondary: "border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
      ghost: "border-transparent hover:bg-primary/20 text-black",
      danger: "border-black bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
      success: "border-black bg-green-500 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-green-600 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
    }

    // Override variant to success when isSuccess is true
    const activeVariant = isSuccess ? 'success' : variant

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs border-2",
      md: "px-6 py-3 text-sm border-2",
      lg: "px-8 py-4 text-base border-2"
    }

    const disabledStyles = "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"

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
          <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
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
