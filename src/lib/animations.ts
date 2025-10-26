/**
 * Shared Animation Variants for Framer Motion
 * 
 * Import these instead of defining inline animations.
 * Keeps animations consistent across the application.
 * 
 * @example
 * import { fadeInUp, stagger } from '@/lib/animations'
 * 
 * <motion.div {...fadeInUp}>
 *   Content
 * </motion.div>
 */

import type { Variants } from 'framer-motion'

/**
 * Fade in with upward motion
 * Best for: Page content, cards, sections
 * Duration: 600ms
 */
export const fadeInUp: Variants = {
  initial: { 
    opacity: 0, 
    y: 30 
  },
  animate: { 
    opacity: 1, 
    y: 0 
  },
  transition: { 
    duration: 0.6, 
    ease: 'easeOut' 
  }
}

/**
 * Stagger children animations
 * Best for: Lists, grids of cards
 * Use on parent container
 * 
 * @example
 * <motion.div variants={stagger} initial="initial" animate="animate">
 *   {items.map(item => (
 *     <motion.div key={item.id} variants={fadeInUp}>...</motion.div>
 *   ))}
 * </motion.div>
 */
export const stagger: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

/**
 * Slide in from right
 * Best for: Side panels, notifications
 * Duration: 400ms
 */
export const slideInRight: Variants = {
  initial: { 
    x: 100, 
    opacity: 0 
  },
  animate: { 
    x: 0, 
    opacity: 1 
  },
  exit: { 
    x: 100, 
    opacity: 0 
  },
  transition: { 
    duration: 0.4, 
    ease: 'easeOut' 
  }
}

/**
 * Slide in from left
 * Best for: Side panels, menus
 * Duration: 400ms
 */
export const slideInLeft: Variants = {
  initial: { 
    x: -100, 
    opacity: 0 
  },
  animate: { 
    x: 0, 
    opacity: 1 
  },
  exit: { 
    x: -100, 
    opacity: 0 
  },
  transition: { 
    duration: 0.4, 
    ease: 'easeOut' 
  }
}

/**
 * Scale in (grow from center)
 * Best for: Modals, popovers
 * Duration: 300ms
 */
export const scaleIn: Variants = {
  initial: { 
    scale: 0.9, 
    opacity: 0 
  },
  animate: { 
    scale: 1, 
    opacity: 1 
  },
  exit: { 
    scale: 0.9, 
    opacity: 0 
  },
  transition: { 
    duration: 0.3, 
    ease: 'easeOut' 
  }
}

/**
 * Simple fade (no movement)
 * Best for: Overlays, backdrops
 * Duration: 200ms
 */
export const fade: Variants = {
  initial: { 
    opacity: 0 
  },
  animate: { 
    opacity: 1 
  },
  exit: { 
    opacity: 0 
  },
  transition: { 
    duration: 0.2 
  }
}

/**
 * Bounce in (with slight overshoot)
 * Best for: Success messages, achievements
 * Duration: 500ms
 */
export const bounceIn: Variants = {
  initial: { 
    scale: 0,
    opacity: 0
  },
  animate: { 
    scale: 1,
    opacity: 1
  },
  transition: {
    type: 'spring',
    stiffness: 260,
    damping: 20,
    duration: 0.5
  }
}

/**
 * Hover scale effect
 * Best for: Interactive cards, buttons
 * 
 * @example
 * <motion.div whileHover={hoverScale}>
 *   Card content
 * </motion.div>
 */
export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.2 }
}

/**
 * Hover lift effect (scale + shadow)
 * Best for: Cards with depth
 * 
 * @example
 * <motion.div whileHover={hoverLift}>
 *   Card content
 * </motion.div>
 */
export const hoverLift = {
  scale: 1.02,
  y: -4,
  transition: { duration: 0.2 }
}

/**
 * Tap effect (press down)
 * Best for: Buttons, clickable items
 * 
 * @example
 * <motion.button whileTap={tapPress}>
 *   Click me
 * </motion.button>
 */
export const tapPress = {
  scale: 0.95,
  transition: { duration: 0.1 }
}

/**
 * Rotate in
 * Best for: Loading indicators, refresh icons
 * Duration: 500ms
 */
export const rotateIn: Variants = {
  initial: {
    rotate: -180,
    opacity: 0
  },
  animate: {
    rotate: 0,
    opacity: 1
  },
  transition: {
    duration: 0.5,
    ease: 'easeOut'
  }
}

/**
 * Page transition (for route changes)
 * Best for: Entire page containers
 * Duration: 400ms
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    y: -20
  },
  transition: {
    duration: 0.4,
    ease: 'easeInOut'
  }
}

/**
 * Container for staggered list animations
 * Use with fadeInUp on children
 * 
 * @example
 * <motion.ul variants={listContainer} initial="hidden" animate="visible">
 *   {items.map(item => (
 *     <motion.li key={item.id} variants={listItem}>...</motion.li>
 *   ))}
 * </motion.ul>
 */
export const listContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

/**
 * List item animation (use with listContainer)
 */
export const listItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
}

/**
 * Shimmer loading effect
 * Best for: Skeleton loaders
 * 
 * @example
 * <motion.div animate={shimmer} />
 */
export const shimmer = {
  backgroundPosition: ['200% 0', '-200% 0'],
  transition: {
    duration: 2,
    ease: 'linear',
    repeat: Infinity
  }
}

/**
 * Pulse effect (for attention)
 * Best for: Notifications, badges with updates
 * 
 * @example
 * <motion.div animate={pulse}>
 *   New notification
 * </motion.div>
 */
export const pulse = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'easeInOut'
  }
}
