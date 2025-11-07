import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface BooksErrorStateProps {
  error?: string
  onRetry?: () => void
}

/**
 * Error state component for book loading failures.
 * 
 * Features:
 * - Friendly error message
 * - Retry button with loading state
 * - Animated entrance
 * - Accessible error messaging
 * 
 * @example
 * ```tsx
 * {error && (
 *   <BooksErrorState 
 *     error={error.message}
 *     onRetry={() => refetch()}
 *   />
 * )}
 * ```
 */
export function BooksErrorState({ 
  error = 'Failed to load books',
  onRetry 
}: BooksErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      role="alert"
      aria-live="assertive"
    >
      {/* Animated Error Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          delay: 0.2, 
          type: 'spring', 
          stiffness: 200,
          damping: 15
        }}
        className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-red-500/10 to-red-500/5 border-2 border-red-500/20"
      >
        <AlertCircle className="h-12 w-12 text-red-500 animate-pulse" />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-foreground mb-2"
      >
        Oops! Something went wrong
      </motion.h3>

      {/* Error Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground max-w-md mb-2"
      >
        {error}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="text-sm text-muted-foreground max-w-md mb-8"
      >
        Please try again or contact support if the problem persists.
      </motion.p>

      {/* Retry Button */}
      {onRetry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={onRetry}
            size="lg"
            variant="default"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </motion.div>
      )}

      {/* Decorative Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />
      </div>
    </motion.div>
  )
}
