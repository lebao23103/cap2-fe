import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const bookButtonVariants = cva(
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-lg font-sans font-bold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wide',
  {
    variants: {
      variant: {
        primary: cn(
          'bg-primary text-primary-foreground',
          'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover shadow-neo',
          'border-2 border-border'
        ),
        secondary: cn(
          'bg-secondary text-secondary-foreground',
          'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover shadow-neo',
          'border-2 border-border'
        ),
        vintage: cn(
          'bg-accent text-accent-foreground',
          'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover shadow-neo',
          'border-2 border-border'
        ),
        leather: cn(
          'bg-card text-card-foreground',
          'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-hover shadow-neo',
          'border-2 border-border'
        ),
        ghost: cn(
          'text-foreground hover:bg-muted',
          'border-2 border-transparent hover:border-border'
        ),
        outline: cn(
          'border-2 border-border',
          'text-foreground',
          'hover:bg-muted'
        )
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg'
      },
      ornate: {
        true: 'tracking-widest',
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
            className='absolute -top-2 right-4 w-6 h-8 text-secondary z-20'
            fill='currentColor'
            viewBox='0 0 24 32'
          >
            <path d='M0 0h24v32l-12-8-12 8z' />
          </svg>
        )}
        {isLinkChild ? (
          React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
            className: cn(
              bookButtonVariants({ variant, size, ornate }),
              (children as React.ReactElement<React.HTMLAttributes<HTMLElement>>).props.className
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
        <Slot
          className={cn(bookButtonVariants({ variant, size, ornate, className }))}
        >
          {children}
        </Slot>
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