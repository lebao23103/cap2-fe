import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { HTMLMotionProps } from "framer-motion"

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "light" | "dark" | "gradient" | "aurora"
  blur?: "sm" | "md" | "lg" | "xl"
  border?: boolean
  glow?: boolean
  hover?: boolean
  children: React.ReactNode
}

const blurValues = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl"
}

const variants = {
  light: "bg-white/10 dark:bg-white/5",
  dark: "bg-black/10 dark:bg-black/20",
  gradient: "bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-white/[0.02]",
  aurora: "bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10"
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    className, 
    variant = "light", 
    blur = "md", 
    border = true,
    glow = false,
    hover = true,
    children,
    ...props 
  }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={hover ? { 
          y: -5, 
          transition: { duration: 0.2 }
        } : undefined}
        className={cn(
          "relative rounded-2xl overflow-hidden",
          blurValues[blur],
          variants[variant],
          border && "border border-white/20 dark:border-white/10",
          glow && "shadow-2xl shadow-primary/20 dark:shadow-primary/10",
          hover && "transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20",
          "before:absolute before:inset-0 before:rounded-2xl",
          "before:bg-gradient-to-br before:from-white/[0.05] before:to-transparent",
          "dark:before:from-white/[0.02] dark:before:to-transparent",
          className
        )}
        {...props}
      >
        {/* Noise texture overlay for glass effect */}
        <div 
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Animated gradient border (optional) */}
        {glow && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: "linear-gradient(45deg, transparent 30%, rgba(139, 92, 246, 0.1) 50%, transparent 70%)",
            }}
            animate={{
              backgroundPosition: ["200% 0%", "-200% 0%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
          />
        )}
      </motion.div>
    )
  }
)

GlassCard.displayName = "GlassCard"

// Sub-components for card structure
const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
GlassCardHeader.displayName = "GlassCardHeader"

const GlassCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      "bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300",
      "bg-clip-text text-transparent",
      className
    )}
    {...props}
  >
    {children}
  </h3>
))
GlassCardTitle.displayName = "GlassCardTitle"

const GlassCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground/80", className)}
    {...props}
  />
))
GlassCardDescription.displayName = "GlassCardDescription"

const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
GlassCardContent.displayName = "GlassCardContent"

const GlassCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      "border-t border-white/10 dark:border-white/5",
      className
    )}
    {...props}
  />
))
GlassCardFooter.displayName = "GlassCardFooter"

export { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardFooter, 
  GlassCardTitle, 
  GlassCardDescription, 
  GlassCardContent 
}