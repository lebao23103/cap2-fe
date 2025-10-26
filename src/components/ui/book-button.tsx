import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const bookButtonVariants = cva(
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-sm font-serif transition-all duration-300 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: cn(
          'bg-burgundy-700 text-parchment-50',
          'hover:bg-burgundy-800 hover:shadow-lg',
          'dark:bg-burgundy-600 dark:hover:bg-burgundy-700',
          'border-2 border-burgundy-900 dark:border-burgundy-800'
        ),
        secondary: cn(
          'bg-forest-600 text-parchment-50',
          'hover:bg-forest-700 hover:shadow-lg',
          'dark:bg-forest-700 dark:hover:bg-forest-800',
          'border-2 border-forest-800 dark:border-forest-900'
        ),
        vintage: cn(
          'bg-gradient-to-b from-parchment-200 to-parchment-300',
          'text-ink-900 font-bold',
          'hover:from-parchment-300 hover:to-parchment-400',
          'dark:from-ink-700 dark:to-ink-800 dark:text-parchment-100',
          'dark:hover:from-ink-600 dark:hover:to-ink-700',
          'border border-parchment-400 dark:border-ink-600',
          'shadow-md hover:shadow-lg'
        ),
        leather: cn(
          'bg-gradient-to-br from-amber-800 to-amber-900',
          'text-parchment-50 font-bold',
          'hover:from-amber-900 hover:to-amber-950',
          'border-2 border-amber-950',
          'shadow-inner hover:shadow-lg'
        ),
        ghost: cn(
          'text-ink-700 dark:text-parchment-200',
          'hover:bg-parchment-200 dark:hover:bg-ink-800',
          'hover:text-ink-900 dark:hover:text-parchment-100'
        ),
        outline: cn(
          'border-2 border-ink-400 dark:border-parchment-400',
          'text-ink-700 dark:text-parchment-200',
          'hover:bg-ink-100 dark:hover:bg-ink-800',
          'hover:border-ink-600 dark:hover:border-parchment-300'
        )
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl'
      },
      ornate: {
        true: 'tracking-wider uppercase',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      ornate: false
    }
  }
)

interface BookButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof bookButtonVariants> {
  asChild?: boolean
  withBookmark?: boolean
}

const BookButton = React.forwardRef<HTMLButtonElement, BookButtonProps>(
  ({ className, variant, size, ornate, asChild = false, withBookmark = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'

    // If children is a Link or similar element, don't wrap in button
    const isLinkChild = React.isValidElement(children) && (
      children.type === Link || 
      children.type === 'a' || 
      (typeof children.type === 'function' && children.type.name === 'Link')
    )
    
    const content = (
      <>
        {withBookmark && (
          <svg
            className='absolute -top-2 right-4 w-6 h-8 text-burgundy-600 dark:text-burgundy-500 z-20'
            fill='currentColor'
            viewBox='0 0 24 32'
          >
            <path d='M0 0h24v32l-12-8-12 8z' />
          </svg>
        )}
        {isLinkChild ? (
          React.cloneElement(children as React.ReactElement, {
            className: cn(
              bookButtonVariants({ variant, size, ornate }),
              (children as React.ReactElement).props.className
            )
          })
        ) : (
          <button
            className={cn(bookButtonVariants({ variant, size, ornate, className }))}
            ref={ref}
            {...props}
          >
            <span className='relative z-10'>{children}</span>
          </button>
        )}
      </>
    )

    if (asChild) {
      return (
        <Comp
          className={cn(bookButtonVariants({ variant, size, ornate, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className='inline-block relative'
      >
        {content}
      </motion.div>
    )
  }
)
BookButton.displayName = 'BookButton'

export { BookButton, bookButtonVariants }