import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  iconClassName?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  iconClassName,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-4',
        className
      )}
    >
      {/* Glow effect behind icon */}
      {Icon && (
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
          <div
            className={cn(
              'relative p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20',
              iconClassName
            )}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.5,
                type: 'spring',
                stiffness: 200,
              }}
            >
              <Icon className="h-12 w-12 text-primary" strokeWidth={1.5} />
            </motion.div>
          </div>
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <Button
          onClick={action.onClick}
          size="lg"
          className="bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg transition-shadow"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
