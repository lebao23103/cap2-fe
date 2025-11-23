import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Keyboard, Search, BookOpen, Menu, ArrowUp } from 'lucide-react'

interface Shortcut {
  keys: string[]
  description: string
  category: string
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['?', 'Shift + /'], description: 'Show keyboard shortcuts', category: 'Navigation' },
  { keys: ['Escape'], description: 'Close dialog or modal', category: 'Navigation' },
  { keys: ['Tab'], description: 'Navigate to next interactive element', category: 'Navigation' },
  { keys: ['Shift + Tab'], description: 'Navigate to previous interactive element', category: 'Navigation' },
  { keys: ['Enter', 'Space'], description: 'Activate button or link', category: 'Navigation' },
  { keys: ['Alt + 1'], description: 'Skip to main content', category: 'Navigation' },
  
  // Reading
  { keys: ['Left Arrow'], description: 'Previous page in book reader', category: 'Reading' },
  { keys: ['Right Arrow'], description: 'Next page in book reader', category: 'Reading' },
  { keys: ['B'], description: 'Toggle bookmark on current page', category: 'Reading' },
  { keys: ['F'], description: 'Toggle favorite/like', category: 'Reading' },
  { keys: ['N'], description: 'Add note to selected text', category: 'Reading' },
  
  // Search & Discovery
  { keys: ['/', 'Ctrl + K'], description: 'Focus search bar', category: 'Search' },
  { keys: ['Arrow Up'], description: 'Navigate up in search results', category: 'Search' },
  { keys: ['Arrow Down'], description: 'Navigate down in search results', category: 'Search' },
  
  // Forms
  { keys: ['Ctrl + Enter'], description: 'Submit form', category: 'Forms' },
  { keys: ['Escape'], description: 'Cancel form editing', category: 'Forms' },
]

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const categories = Array.from(new Set(shortcuts.map(s => s.category)))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-primary/20" aria-hidden="true">
              <Keyboard className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and interact with the application more efficiently
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 mt-4 space-y-6 pr-2">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                {category === 'Navigation' && <Menu className="h-4 w-4 text-primary" aria-hidden="true" />}
                {category === 'Reading' && <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />}
                {category === 'Search' && <Search className="h-4 w-4 text-primary" aria-hidden="true" />}
                {category === 'Forms' && <ArrowUp className="h-4 w-4 text-primary" aria-hidden="true" />}
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter(s => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-muted-foreground flex-1">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-2 ml-4">
                        {shortcut.keys.map((key, keyIndex) => (
                          <div key={keyIndex} className="flex items-center gap-1">
                            {keyIndex > 0 && (
                              <span className="text-xs text-muted-foreground">or</span>
                            )}
                            <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm whitespace-nowrap">
                              {key}
                            </kbd>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t mt-4">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border border-border rounded">?</kbd> anytime to show this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook to manage keyboard shortcuts dialog and global shortcuts
 */
export function useKeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts dialog with ? or Shift+/
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setIsOpen(true)
      }

      // Close with Escape (if open)
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return {
    isOpen,
    setIsOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }
}

/**
 * Component that handles global keyboard shortcuts
 * Place this at the root of your app
 */
export function KeyboardShortcutsProvider() {
  const { isOpen, setIsOpen } = useKeyboardShortcuts()

  return <KeyboardShortcutsDialog open={isOpen} onOpenChange={setIsOpen} />
}



