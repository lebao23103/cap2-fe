import { useCallback, useRef, useEffect } from 'react'

export type AnnouncementPoliteness = 'polite' | 'assertive' | 'off'

interface UseAnnounceOptions {
  /**
   * Default politeness level for announcements
   * @default 'polite'
   */
  defaultPoliteness?: AnnouncementPoliteness
  
  /**
   * Delay before announcing (ms)
   * Useful to ensure screen readers pick up the change
   * @default 100
   */
  delay?: number
  
  /**
   * Auto-clear announcement after duration (ms)
   * Set to 0 to disable auto-clear
   * @default 5000
   */
  clearAfter?: number
}

/**
 * Hook for managing accessible announcements to screen readers
 * 
 * Creates and manages an ARIA live region for dynamic content announcements.
 * Useful for notifying screen reader users of state changes, form submissions,
 * loading states, errors, and other dynamic updates.
 * 
 * @example
 * // Basic usage
 * const announce = useAnnounce()
 * 
 * const handleSubmit = async () => {
 *   announce('Saving...', 'polite')
 *   try {
 *     await saveData()
 *     announce('Saved successfully!', 'polite')
 *   } catch (error) {
 *     announce('Failed to save. Please try again.', 'assertive')
 *   }
 * }
 * 
 * @example
 * // With options
 * const announce = useAnnounce({ 
 *   defaultPoliteness: 'assertive',
 *   clearAfter: 3000 
 * })
 * 
 * @example
 * // Loading state announcement
 * useEffect(() => {
 *   if (isLoading) {
 *     announce('Loading data...')
 *   }
 * }, [isLoading, announce])
 */
export function useAnnounce(options: UseAnnounceOptions = {}) {
  const {
    defaultPoliteness = 'polite',
    delay = 100,
    clearAfter = 5000,
  } = options

  const liveRegionRef = useRef<HTMLDivElement | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Create live region on mount
  useEffect(() => {
    if (!liveRegionRef.current) {
      const region = document.createElement('div')
      region.setAttribute('role', 'status')
      region.setAttribute('aria-live', defaultPoliteness)
      region.setAttribute('aria-atomic', 'true')
      region.className = 'sr-only' // Visually hidden but accessible
      region.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      `
      document.body.appendChild(region)
      liveRegionRef.current = region
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (liveRegionRef.current?.parentNode) {
        liveRegionRef.current.parentNode.removeChild(liveRegionRef.current)
      }
      liveRegionRef.current = null
    }
  }, [defaultPoliteness])

  /**
   * Announce a message to screen readers
   * 
   * @param message - The message to announce
   * @param politeness - How urgently the message should be announced
   *   - 'polite': Wait for user to pause before announcing
   *   - 'assertive': Interrupt current speech to announce immediately
   *   - 'off': Disable announcements
   */
  const announce = useCallback(
    (message: string, politeness: AnnouncementPoliteness = defaultPoliteness) => {
      if (!liveRegionRef.current || politeness === 'off') return

      // Clear any pending announcements
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Update politeness level if changed
      const currentPoliteness = liveRegionRef.current.getAttribute('aria-live')
      if (currentPoliteness !== politeness) {
        liveRegionRef.current.setAttribute('aria-live', politeness)
      }

      // Clear current content
      liveRegionRef.current.textContent = ''

      // Announce after delay (ensures screen readers pick it up)
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = message
          
          // Auto-clear after duration
          if (clearAfter > 0) {
            timeoutRef.current = setTimeout(() => {
              if (liveRegionRef.current) {
                liveRegionRef.current.textContent = ''
              }
            }, clearAfter)
          }
        }
      }, delay)
    },
    [defaultPoliteness, delay, clearAfter]
  )

  return announce
}

/**
 * Hook for announcing loading states
 * 
 * Automatically announces when loading starts and completes.
 * Useful for async operations like data fetching, form submissions, etc.
 * 
 * @example
 * const [isLoading, setIsLoading] = useState(false)
 * useLoadingAnnouncement(isLoading, 'Loading books', 'Books loaded')
 * 
 * const fetchBooks = async () => {
 *   setIsLoading(true)
 *   try {
 *     await api.getBooks()
 *   } finally {
 *     setIsLoading(false)
 *   }
 * }
 */
export function useLoadingAnnouncement(
  isLoading: boolean,
  loadingMessage: string = 'Loading...',
  completeMessage?: string
) {
  const announce = useAnnounce({ defaultPoliteness: 'polite' })
  const wasLoadingRef = useRef(false)

  useEffect(() => {
    if (isLoading && !wasLoadingRef.current) {
      // Started loading
      announce(loadingMessage)
      wasLoadingRef.current = true
    } else if (!isLoading && wasLoadingRef.current) {
      // Finished loading
      if (completeMessage) {
        announce(completeMessage)
      }
      wasLoadingRef.current = false
    }
  }, [isLoading, loadingMessage, completeMessage, announce])
}

/**
 * Hook for announcing form validation errors
 * 
 * Announces errors assertively when they occur.
 * Useful for inline form validation feedback.
 * 
 * @example
 * const [errors, setErrors] = useState<Record<string, string>>({})
 * useErrorAnnouncement(errors)
 * 
 * const validate = () => {
 *   const newErrors: Record<string, string> = {}
 *   if (!email) newErrors.email = 'Email is required'
 *   if (!password) newErrors.password = 'Password is required'
 *   setErrors(newErrors)
 * }
 */
export function useErrorAnnouncement(
  errors: Record<string, string> | string | null | undefined
) {
  const announce = useAnnounce({ defaultPoliteness: 'assertive', clearAfter: 7000 })

  useEffect(() => {
    if (!errors) return

    if (typeof errors === 'string') {
      announce(errors)
    } else {
      const errorMessages = Object.values(errors).filter(Boolean)
      if (errorMessages.length > 0) {
        const message =
          errorMessages.length === 1
            ? errorMessages[0]
            : `${errorMessages.length} errors: ${errorMessages.join(', ')}`
        announce(message)
      }
    }
  }, [errors, announce])
}

/**
 * Hook for announcing success messages
 * 
 * Announces success states politely.
 * Useful for form submissions, save operations, etc.
 * 
 * @example
 * const [success, setSuccess] = useState(false)
 * useSuccessAnnouncement(success, 'Profile updated successfully')
 * 
 * const handleSave = async () => {
 *   try {
 *     await api.updateProfile(data)
 *     setSuccess(true)
 *   } catch (error) {
 *     // handle error
 *   }
 * }
 */
export function useSuccessAnnouncement(
  isSuccess: boolean,
  message: string = 'Action completed successfully'
) {
  const announce = useAnnounce({ defaultPoliteness: 'polite' })

  useEffect(() => {
    if (isSuccess) {
      announce(message)
    }
  }, [isSuccess, message, announce])
}
