/**
 * Accessibility Utilities
 * 
 * Comprehensive helper functions for implementing accessible interactions,
 * ARIA attributes, focus management, and keyboard navigation.
 */

/**
 * Focus Management
 */

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]:not([tabindex^="-"])',
    'area[href]:not([tabindex^="-"])',
    'input:not([disabled]):not([type="hidden"]):not([tabindex^="-"])',
    'select:not([disabled]):not([tabindex^="-"])',
    'textarea:not([disabled]):not([tabindex^="-"])',
    'button:not([disabled]):not([tabindex^="-"])',
    'iframe:not([tabindex^="-"])',
    'object:not([tabindex^="-"])',
    'embed:not([tabindex^="-"])',
    '[contenteditable]:not([tabindex^="-"])',
    '[tabindex]:not([tabindex^="-"])',
  ].join(', ')

  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors)
  )

  // Filter out elements that are not visible
  return elements.filter((element) => {
    const style = window.getComputedStyle(element)
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      (element.offsetWidth > 0 ||
        element.offsetHeight > 0 ||
        element.getClientRects().length > 0)
    )
  })
}

/**
 * Move focus to the first focusable element within a container
 */
export function focusFirstElement(container: HTMLElement): boolean {
  const focusableElements = getFocusableElements(container)
  if (focusableElements.length > 0) {
    focusableElements[0].focus()
    return true
  }
  return false
}

/**
 * Move focus to the last focusable element within a container
 */
export function focusLastElement(container: HTMLElement): boolean {
  const focusableElements = getFocusableElements(container)
  if (focusableElements.length > 0) {
    focusableElements[focusableElements.length - 1].focus()
    return true
  }
  return false
}

/**
 * Check if an element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableElements = getFocusableElements(document.body)
  return focusableElements.includes(element)
}

/**
 * Save currently focused element and return a function to restore it
 */
export function saveFocus(): () => void {
  const activeElement = document.activeElement as HTMLElement
  return () => {
    if (activeElement && activeElement.focus) {
      activeElement.focus()
    }
  }
}

/**
 * Keyboard Navigation Helpers
 */

/**
 * Check if the current key event is a navigation key
 */
export function isNavigationKey(event: KeyboardEvent): boolean {
  return [
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',
    'PageUp',
    'PageDown',
  ].includes(event.key)
}

/**
 * Check if the current key event is an activation key (Enter or Space)
 */
export function isActivationKey(event: KeyboardEvent): boolean {
  return event.key === 'Enter' || event.key === ' '
}

/**
 * Check if the event should trigger an action (Enter, Space, or Click)
 */
export function isActionEvent(
  event: KeyboardEvent | MouseEvent | React.KeyboardEvent | React.MouseEvent
): boolean {
  if ('key' in event) {
    return isActivationKey(event as KeyboardEvent)
  }
  return event.type === 'click'
}

/**
 * Get keyboard shortcut string for display
 */
export function getKeyboardShortcut(
  key: string,
  modifiers: {
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
    meta?: boolean
  } = {}
): string {
  const parts: string[] = []
  
  // Detect platform for correct modifier labels
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  
  if (modifiers.ctrl) parts.push(isMac ? '⌃' : 'Ctrl')
  if (modifiers.alt) parts.push(isMac ? '⌥' : 'Alt')
  if (modifiers.shift) parts.push(isMac ? '⇧' : 'Shift')
  if (modifiers.meta) parts.push(isMac ? '⌘' : 'Win')
  
  parts.push(key)
  
  return parts.join(isMac ? '' : '+')
}

/**
 * Check if keyboard shortcut matches the event
 */
export function matchesShortcut(
  event: KeyboardEvent,
  key: string,
  modifiers: {
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
    meta?: boolean
  } = {}
): boolean {
  return (
    event.key.toLowerCase() === key.toLowerCase() &&
    !!event.ctrlKey === !!modifiers.ctrl &&
    !!event.altKey === !!modifiers.alt &&
    !!event.shiftKey === !!modifiers.shift &&
    !!event.metaKey === !!modifiers.meta
  )
}

/**
 * ARIA Attribute Helpers
 */

/**
 * Generate unique ID for ARIA relationships
 */
let idCounter = 0
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${++idCounter}-${Date.now()}`
}

/**
 * Get ARIA label for an element (checks multiple sources)
 */
export function getAriaLabel(element: HTMLElement): string | null {
  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel

  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby')
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy)
    if (labelElement) return labelElement.textContent
  }

  // Check associated label
  if (element instanceof HTMLInputElement) {
    const label = document.querySelector(`label[for="${element.id}"]`)
    if (label) return label.textContent
  }

  // Check title
  const title = element.getAttribute('title')
  if (title) return title

  return null
}

/**
 * Set ARIA attributes on an element
 */
export function setAriaAttributes(
  element: HTMLElement,
  attributes: Record<string, string | boolean | number | null | undefined>
): void {
  Object.entries(attributes).forEach(([key, value]) => {
    const ariaKey = key.startsWith('aria-') ? key : `aria-${key}`
    
    if (value === null || value === undefined) {
      element.removeAttribute(ariaKey)
    } else {
      element.setAttribute(ariaKey, String(value))
    }
  })
}

/**
 * Get appropriate ARIA role for an element based on its purpose
 */
export function getAriaRole(
  type: 'button' | 'link' | 'checkbox' | 'radio' | 'textbox' | 'combobox' | 'listbox' | 'option' | 'menu' | 'menuitem' | 'dialog' | 'alertdialog' | 'alert' | 'status' | 'progressbar' | 'tab' | 'tabpanel' | 'tooltip'
): string {
  return type
}

/**
 * Screen Reader Helpers
 */

/**
 * Create visually hidden text for screen readers only
 */
export function createScreenReaderText(text: string): HTMLSpanElement {
  const span = document.createElement('span')
  span.textContent = text
  span.className = 'sr-only'
  span.style.cssText = `
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
  return span
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Check if high contrast is preferred
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches
}

/**
 * Check if dark mode is preferred
 */
export function prefersDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Validation & Error Helpers
 */

/**
 * Get ARIA attributes for form field validation state
 */
export function getValidationAriaAttributes(
  isValid: boolean | undefined,
  errorId?: string,
  descriptionId?: string
): Record<string, string | undefined> {
  const attributes: Record<string, string | undefined> = {}
  
  if (isValid !== undefined) {
    attributes['aria-invalid'] = isValid ? 'false' : 'true'
  }
  
  const describedBy: string[] = []
  if (errorId && isValid === false) describedBy.push(errorId)
  if (descriptionId) describedBy.push(descriptionId)
  
  if (describedBy.length > 0) {
    attributes['aria-describedby'] = describedBy.join(' ')
  }
  
  return attributes
}

/**
 * Loading State Helpers
 */

/**
 * Get ARIA attributes for loading state
 */
export function getLoadingAriaAttributes(
  isLoading: boolean,
  label?: string
): Record<string, string | boolean | undefined> {
  if (!isLoading) return {}
  
  return {
    'aria-busy': true,
    'aria-live': 'polite',
    ...(label && { 'aria-label': label }),
  }
}

/**
 * Toggle State Helpers
 */

/**
 * Get ARIA attributes for toggle button (checkbox, switch)
 */
export function getToggleAriaAttributes(
  isPressed: boolean,
  label: string
): Record<string, string | boolean> {
  return {
    'role': 'switch',
    'aria-checked': isPressed,
    'aria-label': label,
  }
}

/**
 * Expandable/Collapsible Helpers
 */

/**
 * Get ARIA attributes for expandable/collapsible element
 */
export function getExpandableAriaAttributes(
  isExpanded: boolean,
  controlsId: string,
  label?: string
): Record<string, string | boolean> {
  return {
    'aria-expanded': isExpanded,
    'aria-controls': controlsId,
    ...(label && { 'aria-label': label }),
  }
}

/**
 * Modal/Dialog Helpers
 */

/**
 * Get ARIA attributes for modal dialog
 */
export function getModalAriaAttributes(
  labelId: string,
  descriptionId?: string
): Record<string, string | boolean> {
  return {
    'role': 'dialog',
    'aria-modal': true,
    'aria-labelledby': labelId,
    ...(descriptionId && { 'aria-describedby': descriptionId }),
  }
}

/**
 * Menu Helpers
 */

/**
 * Get ARIA attributes for menu
 */
export function getMenuAriaAttributes(
  isOpen: boolean,
  menuId: string,
  orientation: 'vertical' | 'horizontal' = 'vertical'
): Record<string, string | boolean> {
  return {
    'role': 'menu',
    'aria-orientation': orientation,
    ...(isOpen && { 'aria-expanded': true }),
    'id': menuId,
  }
}

/**
 * Get ARIA attributes for menu item
 */
export function getMenuItemAriaAttributes(
  isSelected?: boolean,
  isDisabled?: boolean
): Record<string, string | boolean | undefined> {
  return {
    'role': 'menuitem',
    ...(isSelected !== undefined && { 'aria-selected': isSelected }),
    ...(isDisabled && { 'aria-disabled': true }),
  }
}

/**
 * List Helpers
 */

/**
 * Get ARIA attributes for list/listbox
 */
export function getListAriaAttributes(
  listboxId: string,
  selectedId?: string
): Record<string, string | undefined> {
  return {
    'role': 'listbox',
    'id': listboxId,
    ...(selectedId && { 'aria-activedescendant': selectedId }),
  }
}

/**
 * Get ARIA attributes for list option
 */
export function getListOptionAriaAttributes(
  optionId: string,
  isSelected: boolean
): Record<string, string | boolean> {
  return {
    'role': 'option',
    'id': optionId,
    'aria-selected': isSelected,
  }
}

/**
 * Tab Helpers
 */

/**
 * Get ARIA attributes for tab list
 */
export function getTabListAriaAttributes(
  orientation: 'horizontal' | 'vertical' = 'horizontal'
): Record<string, string> {
  return {
    'role': 'tablist',
    'aria-orientation': orientation,
  }
}

/**
 * Get ARIA attributes for tab
 */
export function getTabAriaAttributes(
  tabId: string,
  panelId: string,
  isSelected: boolean
): Record<string, string | boolean | number> {
  return {
    'role': 'tab',
    'id': tabId,
    'aria-controls': panelId,
    'aria-selected': isSelected,
    'tabindex': isSelected ? 0 : -1,
  }
}

/**
 * Get ARIA attributes for tab panel
 */
export function getTabPanelAriaAttributes(
  panelId: string,
  tabId: string
): Record<string, string | number> {
  return {
    'role': 'tabpanel',
    'id': panelId,
    'aria-labelledby': tabId,
    'tabindex': 0,
  }
}

/**
 * Tooltip Helpers
 */

/**
 * Get ARIA attributes for tooltip
 */
export function getTooltipAriaAttributes(
  tooltipId: string
): Record<string, string> {
  return {
    'role': 'tooltip',
    'id': tooltipId,
  }
}

/**
 * Get ARIA attributes for element with tooltip
 */
export function getTooltipTriggerAriaAttributes(
  tooltipId: string,
  isVisible: boolean
): Record<string, string | boolean | undefined> {
  return {
    'aria-describedby': isVisible ? tooltipId : undefined,
  }
}

/**
 * Progress Bar Helpers
 */

/**
 * Get ARIA attributes for progress bar
 */
export function getProgressAriaAttributes(
  value: number,
  min: number = 0,
  max: number = 100,
  label?: string
): Record<string, string | number> {
  return {
    'role': 'progressbar',
    'aria-valuenow': value,
    'aria-valuemin': min,
    'aria-valuemax': max,
    ...(label && { 'aria-label': label }),
    'aria-valuetext': `${Math.round((value / max) * 100)}%`,
  }
}

/**
 * Alert Helpers
 */

/**
 * Get ARIA attributes for alert
 */
export function getAlertAriaAttributes(
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  isLive: boolean = true
): Record<string, string> {
  const role = type === 'error' || type === 'warning' ? 'alert' : 'status'
  
  return {
    'role': role,
    ...(isLive && { 'aria-live': type === 'error' ? 'assertive' : 'polite' }),
    'aria-atomic': 'true',
  }
}

/**
 * Utility Functions
 */

/**
 * Trap focus within an element (useful for modals)
 * Returns cleanup function
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = getFocusableElements(element)
  
  if (focusableElements.length === 0) return () => {}
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return
    
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }
  
  element.addEventListener('keydown', handleKeyDown)
  firstElement.focus()
  
  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Debounce function for keyboard events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Check if element is within viewport
 */
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * Scroll element into view with smooth behavior
 */
export function scrollIntoViewIfNeeded(
  element: HTMLElement,
  options: ScrollIntoViewOptions = {}
): void {
  if (!isElementInViewport(element)) {
    element.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'nearest',
      ...options,
    })
  }
}
