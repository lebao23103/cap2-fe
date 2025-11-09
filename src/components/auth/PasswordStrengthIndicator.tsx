import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'

export interface PasswordStrengthResult {
  score: number // 0-4
  label: string // 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'
  color: string // Tailwind color class
  feedback: string[]
}

export interface PasswordStrengthIndicatorProps {
  password: string
  show?: boolean
  className?: string
}

/**
 * Calculates password strength based on common criteria.
 * 
 * Scoring:
 * - 0: Empty or very weak (<6 chars)
 * - 1: Weak (6+ chars, single type)
 * - 2: Fair (6+ chars, 2 types)
 * - 3: Good (8+ chars, 3 types, or 12+ chars)
 * - 4: Strong (12+ chars, all 4 types)
 */
function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = []
  let score = 0

  // Empty password
  if (!password) {
    return {
      score: 0,
      label: 'Very Weak',
      color: 'text-gray-400',
      feedback: ['Enter a password'],
    }
  }

  // Length check
  const length = password.length
  if (length < 6) {
    feedback.push('Use at least 6 characters')
  } else if (length < 8) {
    score += 1
    feedback.push('Use 8+ characters for better security')
  } else if (length < 12) {
    score += 2
  } else {
    score += 3
    feedback.push('Great length!')
  }

  // Character type checks
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[^a-zA-Z0-9]/.test(password)

  const typeCount = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length

  if (typeCount === 1) {
    feedback.push('Add uppercase, numbers, or symbols')
  } else if (typeCount === 2) {
    score += 1
    feedback.push('Add more character types')
  } else if (typeCount === 3) {
    score += 1
    feedback.push('Almost there!')
  } else if (typeCount === 4) {
    score += 2
  }

  // Common patterns (reduce score)
  const commonPatterns = /^(password|123456|qwerty|abc123|admin|letmein)/i
  if (commonPatterns.test(password)) {
    score = Math.max(0, score - 2)
    feedback.push('Avoid common passwords')
  }

  // Repeated characters
  const hasRepeats = /(.)\1{2,}/.test(password)
  if (hasRepeats) {
    score = Math.max(0, score - 1)
    feedback.push('Avoid repeating characters')
  }

  // Cap score at 4
  score = Math.min(4, score)

  // Generate label and color based on score
  const strengthMap = {
    0: { label: 'Very Weak', color: 'text-destructive' },
    1: { label: 'Weak', color: 'text-orange-500' },
    2: { label: 'Fair', color: 'text-yellow-500' },
    3: { label: 'Good', color: 'text-blue-500' },
    4: { label: 'Strong', color: 'text-success' },
  }

  const { label, color } = strengthMap[score as keyof typeof strengthMap]

  return { score, label, color, feedback }
}

/**
 * Visual password strength indicator with accessibility.
 * 
 * Features:
 * - Real-time strength calculation
 * - Color-coded visual meter
 * - Helpful feedback messages
 * - ARIA live region for screen reader updates
 * - Smooth animations
 * 
 * @example
 * ```tsx
 * const [password, setPassword] = useState('')
 * 
 * <FormInput
 *   label="Password"
 *   type="password"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 * />
 * <PasswordStrengthIndicator password={password} show={password.length > 0} />
 * ```
 */
export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  show = true,
  className,
}) => {
  const strength = useMemo(() => calculatePasswordStrength(password), [password])

  if (!show || !password) {
    return null
  }

  const bars = [0, 1, 2, 3]

  return (
    <div className={cn('space-y-2', className)} aria-live="polite" aria-atomic="true">
      {/* Visual strength meter */}
      <div className="flex gap-1" role="img" aria-label={`Password strength: ${strength.label}`}>
        {bars.map((index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              index < strength.score
                ? strength.color.replace('text-', 'bg-')
                : 'bg-muted',
              // Animate bars sequentially
              index < strength.score && 'animate-scale-in',
            )}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          />
        ))}
      </div>

      {/* Strength label and feedback */}
      <div className="space-y-1">
        <p className={cn('text-sm font-medium', strength.color)}>
          {strength.label}
        </p>
        {strength.feedback.length > 0 && (
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {strength.feedback.map((item, index) => (
              <li key={index} className="animate-slide-in-down" style={{ animationDelay: `${index * 50}ms` }}>
                • {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/**
 * Hook to get password strength result.
 * Useful for form validation logic.
 * 
 * @example
 * ```tsx
 * const { score, label } = usePasswordStrength(password)
 * const isStrongEnough = score >= 2
 * ```
 */
export function usePasswordStrength(password: string): PasswordStrengthResult {
  return useMemo(() => calculatePasswordStrength(password), [password])
}
