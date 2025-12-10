import React, { useEffect, forwardRef } from 'react'
import { Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useAnnounce } from '@/hooks/useAnnounce'

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  success?: boolean
  loading?: boolean
  helperText?: string
  showPasswordToggle?: boolean
  onPasswordToggle?: () => void
  showPassword?: boolean
}

/**
 * Enhanced form input component with all interactive states.
 * 
 * Features:
 * - Idle, focus, error, success, disabled, loading states
 * - Accessible error announcements
 * - Password visibility toggle
 * - Helper text support
 * - Icon indicators for state
 * - Smooth animations with reduced motion support
 * 
 * @example
 * ```tsx
 * const [email, setEmail] = useState('')
 * const [error, setError] = useState<string>()
 * 
 * <FormInput
 *   label="Email"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   error={error}
 *   helperText="We'll never share your email"
 * />
 * ```
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      success,
      loading,
      helperText,
      showPasswordToggle,
      onPasswordToggle,
      showPassword,
      className,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const announce = useAnnounce()
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-')
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    // Announce errors and success to screen readers
    useEffect(() => {
      if (error) {
        announce(error, 'assertive')
      } else if (success && !loading) {
        announce(`${label} is valid`, 'polite')
      }
    }, [error, success, announce, label, loading])

    return (
      <div className="space-y-2">
        <Label
          htmlFor={inputId}
          className={cn(
            'text-sm font-medium transition-colors',
            error && 'text-destructive',
            success && 'text-success',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {label}
          {required && (
            <span className="text-destructive ml-1" aria-label="required">
              *
            </span>
          )}
        </Label>

        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            disabled={disabled || loading}
            required={required}
            className={cn(
              // Base styles - Neo-Brutalist
              'bg-background text-foreground border-2 border-border h-12 rounded-none transition-all pr-10 font-bold placeholder:text-muted-foreground',
              // Focus styles
              'focus:ring-0 focus:border-foreground focus:shadow-neo focus:translate-x-[-2px] focus:translate-y-[-2px]',
              // Error state
              error && [
                'border-destructive',
                'focus:border-destructive',
                'focus:shadow-neo-pink',
                'animate-shake',
              ],
              // Success state
              success && !error && [
                'border-green-500',
                'focus:border-green-500',
                'focus:shadow-neo', // Or a green shadow if defined, otherwise standard neo
              ],
              // Loading state
              loading && 'cursor-wait',
              // Disabled state
              disabled && 'opacity-50 cursor-not-allowed bg-muted',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={cn(
              error && errorId,
              helperText && helperId
            )}
            {...props}
          />

          {/* Right side icons */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Loading spinner */}
            {loading && (
              <Loader2
                className="h-4 w-4 animate-spin text-muted-foreground"
                aria-label="Loading"
              />
            )}

            {/* Success checkmark */}
            {success && !error && !loading && (
              <Check
                className="h-4 w-4 text-green-500 dark:text-green-400 animate-scale-in"
                aria-hidden="true"
              />
            )}

            {/* Error icon */}
            {error && !loading && (
              <AlertCircle
                className="h-4 w-4 text-destructive animate-scale-in"
                aria-hidden="true"
              />
            )}

            {/* Password toggle */}
            {showPasswordToggle && onPasswordToggle && (
              <button
                type="button"
                onClick={onPasswordToggle}
                disabled={disabled || loading}
                className={cn(
                  'p-1 rounded transition-colors text-foreground',
                  'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'interactive'
                )}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Helper text */}
        {helperText && !error && (
          <p
            id={helperId}
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            role="alert"
            className={cn(
              'text-sm text-destructive',
              'animate-slide-in-down'
            )}
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'
