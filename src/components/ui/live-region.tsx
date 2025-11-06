import { useEffect, useRef } from 'react'

export type LiveRegionPoliteness = 'polite' | 'assertive'

interface LiveRegionProps {
  message: string
  politeness?: LiveRegionPoliteness
  clearOnUnmount?: boolean
}

/**
 * LiveRegion component for accessibility announcements
 * 
 * This component creates an ARIA live region that announces dynamic content changes
 * to screen reader users without requiring focus changes.
 * 
 * @example
 * // Announce form submission success
 * {showSuccess && (
 *   <LiveRegion 
 *     message="Settings saved successfully" 
 *     politeness="polite" 
 *   />
 * )}
 * 
 * @example
 * // Announce critical error
 * {error && (
 *   <LiveRegion 
 *     message={error} 
 *     politeness="assertive" 
 *   />
 * )}
 */
export function LiveRegion({ 
  message, 
  politeness = 'polite',
  clearOnUnmount = true 
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Announce the message when it changes
    if (regionRef.current && message) {
      // Clear and re-announce to ensure screen readers pick it up
      regionRef.current.textContent = ''
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message
        }
      }, 100)
    }

    return () => {
      if (clearOnUnmount && regionRef.current) {
        regionRef.current.textContent = ''
      }
    }
  }, [message, clearOnUnmount])

  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    />
  )
}

/**
 * Hook to manage live region announcements
 * 
 * @example
 * const { announce } = useLiveRegion()
 * 
 * const handleSubmit = async () => {
 *   try {
 *     await saveData()
 *     announce('Data saved successfully')
 *   } catch (error) {
 *     announce('Failed to save data', 'assertive')
 *   }
 * }
 */
export function useLiveRegion() {
  const regionRef = useRef<HTMLDivElement | null>(null)

  const announce = (message: string, politeness: LiveRegionPoliteness = 'polite') => {
    if (!regionRef.current) {
      // Create live region if it doesn't exist
      const region = document.createElement('div')
      region.setAttribute('role', 'status')
      region.setAttribute('aria-live', politeness)
      region.setAttribute('aria-atomic', 'true')
      region.className = 'sr-only'
      document.body.appendChild(region)
      regionRef.current = region
    }

    // Update politeness if needed
    if (regionRef.current.getAttribute('aria-live') !== politeness) {
      regionRef.current.setAttribute('aria-live', politeness)
    }

    // Clear and re-announce
    regionRef.current.textContent = ''
    setTimeout(() => {
      if (regionRef.current) {
        regionRef.current.textContent = message
      }
    }, 100)
  }

  const clear = () => {
    if (regionRef.current) {
      regionRef.current.textContent = ''
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (regionRef.current && regionRef.current.parentNode) {
        regionRef.current.parentNode.removeChild(regionRef.current)
      }
    }
  }, [])

  return { announce, clear }
}
