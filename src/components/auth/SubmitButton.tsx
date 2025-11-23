import React from 'react'
import { Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLoadingAnnouncement, useSuccessAnnouncement } from '@/hooks/useAnnounce'

export interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  success?: boolean
  loadingText?: string
  successText?: string
  children: React.ReactNode
}

/**
 * Enhanced submit button with loading and success states.
 * 
 * Features:
 * - Loading spinner with accessible announcement
 * - Success checkmark animation
 * - Automatic disabled state during loading
 * - Screen reader announcements for state changes
 * - Smooth animations with reduced motion support
 * 
 * @example
 * ```tsx
 * const [isLoading, setIsLoading] = useState(false)
 * const [isSuccess, setIsSuccess] = useState(false)
 * 
 * const handleSubmit = async () => {
 *   setIsLoading(true)
 *   await api.login()
 *   setIsLoading(false)
 *   setIsSuccess(true)
 * }
 * 
 * <SubmitButton
 *   loading={isLoading}
 *   success={isSuccess}
 *   loadingText="Signing in..."
 *   successText="Success!"
 *   onClick={handleSubmit}
 * >
 *   Sign In
 * </SubmitButton>
 * ```
 */
export const SubmitButton = React.forwardRef<HTMLButtonElement, SubmitButtonProps>(
  (
    {
      loading,
      success,
      loadingText = 'Loading...',
      successText,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    // Announce loading and success states to screen readers
    useLoadingAnnouncement(loading || false, loadingText)
    useSuccessAnnouncement(success || false, successText || 'Success')

    // Display text based on state
    const displayText = React.useMemo(() => {
      if (success && successText) return successText
      if (loading && loadingText) return loadingText
      return children
    }, [loading, success, loadingText, successText, children])

    return (
      <Button
        ref={ref}
        type="submit"
        disabled={disabled || loading || success}
        className={cn(
          'relative w-full transition-all',
          // Success state
          success && [
            'bg-success hover:bg-success',
            'animate-bounce-in'
          ],
          // Loading state
          loading && 'cursor-wait',
          className
        )}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <Loader2
            className="mr-2 h-4 w-4 animate-spin"
            aria-hidden="true"
          />
        )}

        {/* Success checkmark */}
        {success && (
          <Check
            className="mr-2 h-4 w-4 animate-scale-in"
            aria-hidden="true"
          />
        )}

        {/* Button text */}
        <span className={cn(
          'transition-opacity',
          (loading || success) && 'opacity-90'
        )}>
          {displayText}
        </span>

        {/* Live region for screen reader updates (handled by hooks) */}
      </Button>
    )
  }
)

SubmitButton.displayName = 'SubmitButton'
