import { BookOpen, Search, Heart, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface BooksEmptyStateProps {
  type?: 'no-results' | 'no-books' | 'no-favorites'
  searchTerm?: string
  onClearFilters?: () => void
}

/**
 * Empty state component for book lists.
 * 
 * Features:
 * - Different states for various scenarios
 * - Animated illustration
 * - Clear call-to-action
 * - Accessible messaging
 * 
 * @example
 * ```tsx
 * {filteredBooks.length === 0 && (
 *   <BooksEmptyState 
 *     type="no-results"
 *     searchTerm={searchTerm}
 *     onClearFilters={() => setFilters({})}
 *   />
 * )}
 * ```
 */
export function BooksEmptyState({ 
  type = 'no-results', 
  searchTerm,
  onClearFilters 
}: BooksEmptyStateProps) {
  const config = {
    'no-results': {
      icon: Search,
      title: 'No books found',
      description: searchTerm 
        ? `We couldn't find any books matching "${searchTerm}"`
        : 'Try adjusting your filters to see more results',
      action: 'Clear filters',
      color: 'text-blue-500'
    },
    'no-books': {
      icon: BookOpen,
      title: 'No books yet',
      description: 'Start building your library by adding books to your collection',
      action: 'Browse books',
      color: 'text-primary'
    },
    'no-favorites': {
      icon: Heart,
      title: 'No favorites yet',
      description: 'Start adding books to your favorites to see them here',
      action: 'Explore books',
      color: 'text-red-500'
    }
  }

  const { icon: Icon, title, description, action, color } = config[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          delay: 0.2, 
          type: 'spring', 
          stiffness: 200,
          damping: 15
        }}
        className={`inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-${color}/10 to-${color}/5 border-2 border-${color}/20`}
      >
        <Icon className={`h-12 w-12 ${color}`} />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-foreground mb-2"
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground max-w-md mb-8"
      >
        {description}
      </motion.p>

      {/* Action Button */}
      {onClearFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={onClearFilters}
            size="lg"
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {action}
          </Button>
        </motion.div>
      )}

      {/* Decorative Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
      </div>
    </motion.div>
  )
}
