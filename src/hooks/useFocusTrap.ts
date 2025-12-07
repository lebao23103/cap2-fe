import { useEffect, useRef, useCallback } from 'react'

interface UseFocusTrapOptions {
  /**
   * Whether the focus trap is active
   * @default true
   */
  enabled?: boolean

  /**
   * Element to focus when trap activates
   * If not provided, focuses first focusable element
   */
  initialFocus?: HTMLElement | null

  /**
   * Element to focus when trap deactivates
   * If not provided, returns focus to element that triggered the trap
   */
  returnFocus?: HTMLElement | null

  /**
   * Whether to return focus on deactivation
   * @default true
   */
  shouldReturnFocus?: boolean

  /**
   * Callback when user tries to tab out of the trap
   */
  onEscape?: () => void

  /**
   * Whether pressing Escape should trigger onEscape
   * @default true
   */
  escapeDeactivates?: boolean
}

/**
 * Hook for trapping focus within a container (modal, dialog, drawer, etc.)
 * 
 * Ensures keyboard navigation stays within the trapped element, critical for
 * accessible modal dialogs and overlays. Manages focus on mount/unmount.
 * 
 * @example
 * // Basic usage in a modal
 * const Modal = ({ isOpen, onClose }) => {
 *   const modalRef = useFocusTrap<HTMLDivElement>({ 
 *     enabled: isOpen,
 *     onEscape: onClose 
 *   })
 * 
 *   if (!isOpen) return null
 * 
 *   return (
 *     <div ref={modalRef} role="dialog" aria-modal="true">
 *       <h2>Modal Title</h2>
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   )
 * }
 * 
 * @example
 * // With custom initial focus
 * const Dialog = ({ isOpen }) => {
 *   const closeButtonRef = useRef<HTMLButtonElement>(null)
 *   const dialogRef = useFocusTrap<HTMLDivElement>({
 *     enabled: isOpen,
 *     initialFocus: closeButtonRef.current
 *   })
 * 
 *   return (
 *     <div ref={dialogRef}>
 *       <h2>Dialog</h2>
 *       <button ref={closeButtonRef}>Close</button>
 *     </div>
 *   )
 * }
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  options: UseFocusTrapOptions = {}
): React.RefObject<T> {
  const {
    enabled = true,
    initialFocus = null,
    returnFocus = null,
    shouldReturnFocus = true,
    onEscape,
    escapeDeactivates = true,
  } = options

  const containerRef = useRef<T>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  /**
   * Get all focusable elements within the container
   */
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return []

    const focusableSelectors = [
      'a[href]',
      'area[href]',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'iframe',
      'object',
      'embed',
      '[contenteditable]',
      '[tabindex]:not([tabindex^="-"])',
    ].join(', ')

    const elements = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    )

    // Filter out elements that are not visible
    return elements.filter((element) => {
      return (
        element.offsetWidth > 0 ||
        element.offsetHeight > 0 ||
        element.getClientRects().length > 0
      )
    })
  }, [])

  /**
   * Handle Tab key to trap focus
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || !containerRef.current) return

      // Handle Escape key
      if (event.key === 'Escape' && escapeDeactivates && onEscape) {
        event.preventDefault()
        onEscape()
        return
      }

      // Only handle Tab key
      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) {
        // No focusable elements, prevent tabbing
        event.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement as HTMLElement

      // Shift + Tab (backwards)
      if (event.shiftKey) {
        if (activeElement === firstElement || !containerRef.current.contains(activeElement)) {
          event.preventDefault()
          lastElement.focus()
        }
      }
      // Tab (forwards)
      else {
        if (activeElement === lastElement || !containerRef.current.contains(activeElement)) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    },
    [enabled, escapeDeactivates, onEscape, getFocusableElements]
  )

  /**
   * Set initial focus when trap activates
   */
  useEffect(() => {
    if (!enabled || !containerRef.current) return

    // Store currently focused element to return focus later
    previouslyFocusedElement.current = document.activeElement as HTMLElement

    // Set initial focus
    const setInitialFocus = () => {
      if (initialFocus) {
        initialFocus.focus()
      } else {
        const focusableElements = getFocusableElements()
        if (focusableElements.length > 0) {
          focusableElements[0].focus()
        } else if (containerRef.current) {
          // If no focusable elements, focus the container itself
          containerRef.current.setAttribute('tabindex', '-1')
          containerRef.current.focus()
        }
      }
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(setInitialFocus, 10)

    return () => clearTimeout(timeoutId)
  }, [enabled, initialFocus, getFocusableElements])

  /**
   * Return focus when trap deactivates
   */
  useEffect(() => {
    return () => {
      if (shouldReturnFocus) {
        const elementToFocus = returnFocus || previouslyFocusedElement.current
        if (elementToFocus && elementToFocus.focus) {
          // Small delay to ensure modal has closed
          setTimeout(() => {
            elementToFocus.focus()
          }, 10)
        }
      }
    }
  }, [shouldReturnFocus, returnFocus])

  /**
   * Add/remove keyboard event listener
   */
  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])

  return containerRef as React.RefObject<T>
}

/**
 * Simpler focus trap for common modal/dialog use case
 * 
 * @example
 * const Modal = ({ isOpen, onClose }) => {
 *   const modalRef = useModalFocusTrap(isOpen, onClose)
 * 
 *   if (!isOpen) return null
 *   return <div ref={modalRef}>...</div>
 * }
 */
export function useModalFocusTrap<T extends HTMLElement = HTMLElement>(
  isOpen: boolean,
  onClose?: () => void
): React.RefObject<T> {
  return useFocusTrap<T>({
    enabled: isOpen,
    onEscape: onClose,
    shouldReturnFocus: true,
    escapeDeactivates: true,
  })
}

/**
 * Focus trap that doesn't return focus (useful for redirecting flows)
 * 
 * @example
 * const Drawer = ({ isOpen }) => {
 *   const drawerRef = useNoReturnFocusTrap(isOpen)
 *   
 *   if (!isOpen) return null
 *   return <aside ref={drawerRef}>...</aside>
 * }
 */
export function useNoReturnFocusTrap<T extends HTMLElement = HTMLElement>(
  isActive: boolean
): React.RefObject<T> {
  return useFocusTrap<T>({
    enabled: isActive,
    shouldReturnFocus: false,
  })
}
