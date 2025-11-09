import { useEffect, useRef, useCallback, useState } from 'react'

interface UseKeyboardNavigationOptions {
  /**
   * Whether keyboard navigation is enabled
   * @default true
   */
  enabled?: boolean

  /**
   * Whether navigation should loop (wrap around)
   * @default true
   */
  loop?: boolean

  /**
   * Orientation of the navigation
   * @default 'both'
   */
  orientation?: 'horizontal' | 'vertical' | 'both'

  /**
   * Initial selected index
   * @default 0
   */
  initialIndex?: number

  /**
   * Callback when selection changes
   */
  onSelectionChange?: (index: number) => void

  /**
   * Callback when Enter/Space is pressed on selected item
   */
  onActivate?: (index: number) => void

  /**
   * CSS selector for navigable items
   * @default '[role="option"], [role="menuitem"], button:not([disabled]), a[href]'
   */
  itemSelector?: string

  /**
   * Whether to set focus on navigate
   * @default true
   */
  focusOnNavigate?: boolean

  /**
   * Whether to use roving tabindex pattern
   * @default false
   */
  useRovingTabIndex?: boolean
}

/**
 * Hook for implementing keyboard navigation with arrow keys
 * 
 * Enables accessible navigation through lists, menus, grids, etc. using
 * arrow keys. Follows ARIA authoring practices for keyboard interactions.
 * 
 * @example
 * // Basic list navigation
 * const List = ({ items }) => {
 *   const { containerRef, selectedIndex } = useKeyboardNavigation({
 *     onActivate: (index) => handleSelect(items[index])
 *   })
 * 
 *   return (
 *     <ul ref={containerRef} role="listbox">
 *       {items.map((item, index) => (
 *         <li 
 *           key={item.id}
 *           role="option"
 *           aria-selected={selectedIndex === index}
 *         >
 *           {item.name}
 *         </li>
 *       ))}
 *     </ul>
 *   )
 * }
 * 
 * @example
 * // Menu navigation
 * const Menu = ({ options }) => {
 *   const { containerRef, selectedIndex, setSelectedIndex } = useKeyboardNavigation({
 *     orientation: 'vertical',
 *     onActivate: (index) => handleMenuAction(options[index])
 *   })
 * 
 *   return (
 *     <div ref={containerRef} role="menu">
 *       {options.map((option, index) => (
 *         <button
 *           key={option.id}
 *           role="menuitem"
 *           aria-selected={selectedIndex === index}
 *         >
 *           {option.label}
 *         </button>
 *       ))}
 *     </div>
 *   )
 * }
 */
export function useKeyboardNavigation<T extends HTMLElement = HTMLElement>(
  options: UseKeyboardNavigationOptions = {}
) {
  const {
    enabled = true,
    loop = true,
    orientation = 'both',
    initialIndex = 0,
    onSelectionChange,
    onActivate,
    itemSelector = '[role="option"], [role="menuitem"], button:not([disabled]), a[href]',
    focusOnNavigate = true,
    useRovingTabIndex = false,
  } = options

  const containerRef = useRef<T>(null)
  const [selectedIndex, setSelectedIndex] = useState(initialIndex)

  /**
   * Get all navigable items
   */
  const getItems = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return []
    
    const items = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(itemSelector)
    )
    
    // Filter out hidden elements
    return items.filter((item) => {
      const style = window.getComputedStyle(item)
      return style.display !== 'none' && style.visibility !== 'hidden'
    })
  }, [itemSelector])

  /**
   * Navigate to a specific index
   */
  const navigateToIndex = useCallback(
    (newIndex: number) => {
      const items = getItems()
      if (items.length === 0) return

      let targetIndex = newIndex

      // Handle looping
      if (loop) {
        if (targetIndex < 0) {
          targetIndex = items.length - 1
        } else if (targetIndex >= items.length) {
          targetIndex = 0
        }
      } else {
        targetIndex = Math.max(0, Math.min(targetIndex, items.length - 1))
      }

      setSelectedIndex(targetIndex)
      onSelectionChange?.(targetIndex)

      // Update tabindex for roving tabindex pattern
      if (useRovingTabIndex) {
        items.forEach((item, index) => {
          item.setAttribute('tabindex', index === targetIndex ? '0' : '-1')
        })
      }

      // Focus the new item
      if (focusOnNavigate) {
        items[targetIndex]?.focus()
      }
    },
    [getItems, loop, onSelectionChange, focusOnNavigate, useRovingTabIndex]
  )

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      const items = getItems()
      if (items.length === 0) return

      let handled = false

      switch (event.key) {
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            event.preventDefault()
            navigateToIndex(selectedIndex + 1)
            handled = true
          }
          break

        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            event.preventDefault()
            navigateToIndex(selectedIndex - 1)
            handled = true
          }
          break

        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            event.preventDefault()
            navigateToIndex(selectedIndex + 1)
            handled = true
          }
          break

        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            event.preventDefault()
            navigateToIndex(selectedIndex - 1)
            handled = true
          }
          break

        case 'Home':
          event.preventDefault()
          navigateToIndex(0)
          handled = true
          break

        case 'End':
          event.preventDefault()
          navigateToIndex(items.length - 1)
          handled = true
          break

        case 'Enter':
        case ' ': // Space
          if (onActivate) {
            event.preventDefault()
            onActivate(selectedIndex)
            handled = true
          }
          break
      }

      return handled
    },
    [enabled, orientation, selectedIndex, navigateToIndex, onActivate, getItems]
  )

  /**
   * Initialize roving tabindex if enabled
   */
  useEffect(() => {
    if (!useRovingTabIndex || !containerRef.current) return

    const items = getItems()
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === selectedIndex ? '0' : '-1')
    })
  }, [useRovingTabIndex, selectedIndex, getItems])

  /**
   * Add keyboard event listener
   */
  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const container = containerRef.current
    container.addEventListener('keydown', handleKeyDown as EventListener)

    return () => {
      container.removeEventListener('keydown', handleKeyDown as EventListener)
    }
  }, [enabled, handleKeyDown])

  /**
   * Reset to initial index when items change
   */
  useEffect(() => {
    const items = getItems()
    if (items.length > 0 && selectedIndex >= items.length) {
      setSelectedIndex(Math.min(initialIndex, items.length - 1))
    }
  }, [getItems, selectedIndex, initialIndex])

  return {
    containerRef,
    selectedIndex,
    setSelectedIndex: navigateToIndex,
    navigateNext: () => navigateToIndex(selectedIndex + 1),
    navigatePrevious: () => navigateToIndex(selectedIndex - 1),
    navigateFirst: () => navigateToIndex(0),
    navigateLast: () => {
      const items = getItems()
      navigateToIndex(items.length - 1)
    },
  }
}

/**
 * Hook for vertical list navigation (common case)
 * 
 * @example
 * const Dropdown = ({ options }) => {
 *   const { containerRef, selectedIndex } = useListNavigation({
 *     onActivate: (index) => selectOption(options[index])
 *   })
 * 
 *   return (
 *     <div ref={containerRef} role="listbox">
 *       {options.map((option, index) => (
 *         <div role="option" aria-selected={selectedIndex === index}>
 *           {option.label}
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 */
export function useListNavigation<T extends HTMLElement = HTMLElement>(
  options: Omit<UseKeyboardNavigationOptions, 'orientation'> = {}
) {
  return useKeyboardNavigation<T>({
    ...options,
    orientation: 'vertical',
  })
}

/**
 * Hook for horizontal navigation (tabs, carousels, etc.)
 * 
 * @example
 * const Tabs = ({ tabs }) => {
 *   const { containerRef, selectedIndex } = useHorizontalNavigation({
 *     onActivate: (index) => setActiveTab(index)
 *   })
 * 
 *   return (
 *     <div ref={containerRef} role="tablist">
 *       {tabs.map((tab, index) => (
 *         <button role="tab" aria-selected={selectedIndex === index}>
 *           {tab.label}
 *         </button>
 *       ))}
 *     </div>
 *   )
 * }
 */
export function useHorizontalNavigation<T extends HTMLElement = HTMLElement>(
  options: Omit<UseKeyboardNavigationOptions, 'orientation'> = {}
) {
  return useKeyboardNavigation<T>({
    ...options,
    orientation: 'horizontal',
  })
}

/**
 * Hook for menu navigation with ARIA pattern
 * 
 * @example
 * const Menu = ({ items }) => {
 *   const { containerRef, selectedIndex } = useMenuNavigation({
 *     onActivate: (index) => executeAction(items[index])
 *   })
 * 
 *   return (
 *     <div ref={containerRef} role="menu">
 *       {items.map((item, index) => (
 *         <button 
 *           role="menuitem"
 *           tabIndex={selectedIndex === index ? 0 : -1}
 *         >
 *           {item.label}
 *         </button>
 *       ))}
 *     </div>
 *   )
 * }
 */
export function useMenuNavigation<T extends HTMLElement = HTMLElement>(
  options: Omit<UseKeyboardNavigationOptions, 'orientation' | 'itemSelector' | 'useRovingTabIndex'> = {}
) {
  return useKeyboardNavigation<T>({
    ...options,
    orientation: 'vertical',
    itemSelector: '[role="menuitem"]',
    useRovingTabIndex: true,
  })
}

/**
 * Hook for grid navigation (2D navigation)
 * 
 * @example
 * const Grid = ({ items, columns }) => {
 *   const { containerRef, selectedIndex } = useGridNavigation({
 *     columns,
 *     onActivate: (index) => selectItem(items[index])
 *   })
 * 
 *   return (
 *     <div ref={containerRef} role="grid">
 *       {items.map((item, index) => (
 *         <div 
 *           role="gridcell"
 *           tabIndex={selectedIndex === index ? 0 : -1}
 *         >
 *           {item.name}
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 */
export function useGridNavigation<T extends HTMLElement = HTMLElement>(
  options: UseKeyboardNavigationOptions & { columns: number }
) {
  const { columns, ...restOptions } = options
  
  return useKeyboardNavigation<T>({
    ...restOptions,
    orientation: 'both',
    itemSelector: '[role="gridcell"], [role="option"]',
    useRovingTabIndex: true,
  })
}
