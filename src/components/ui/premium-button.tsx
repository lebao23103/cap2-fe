import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const premiumButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        gradient: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
        glass: "backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 text-foreground hover:bg-white/20 dark:hover:bg-black/20",
        glow: "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40",
        aurora: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        neon: "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_2rem_-0.5rem] hover:shadow-primary transition-all duration-300",
        floating: "bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg animate-float",
        shimmer: "bg-gradient-to-r from-slate-900 to-slate-700 text-white relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-1000",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "hover:animate-bounce",
        spin: "hover:animate-spin",
      }
    },
    defaultVariants: {
      variant: "gradient",
      size: "default",
      animation: "none",
    },
  }
)

export interface PremiumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof premiumButtonVariants> {
  asChild?: boolean
  ripple?: boolean
  glow?: boolean
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, variant, size, animation, asChild = false, ripple = true, glow = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const [ripples, setRipples] = React.useState<{ x: number; y: number; size: number }[]>([])

    const handleRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple) return

      const button = event.currentTarget as HTMLElement
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2

      const newRipple = { x, y, size }
      setRipples((prev) => [...prev, newRipple])

      setTimeout(() => {
        setRipples((prevRipples) => prevRipples.slice(1))
      }, 600)
    }

    const rootClass = cn(
      premiumButtonVariants({ variant, size, animation, className }),
      glow && "shadow-[0_0_2rem_-0.5rem] shadow-primary",
      "group relative"
    )

    return (
      <motion.div
        whileHover={{ scale: variant === 'floating' ? 1.05 : 1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="relative inline-block"
      >
        {/* Clickable element */}
        <Comp
          className={rootClass}
          ref={ref}
          onMouseDown={handleRipple}
          {...props}
        >
          {asChild ? (
            // When asChild, children must be a single React element (e.g., <Link />)
            children
          ) : (
            <span className="relative z-10 flex items-center justify-center gap-2">
              {children}
            </span>
          )}
        </Comp>

        {/* Visual overlays outside Slot to satisfy single-child constraint */}
        {(variant === 'gradient' || variant === 'aurora') && (
          <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}

        {/* Ripple Effect */}
        {ripple && ripples.map((r, index) => (
          <motion.span
            key={index}
            className="pointer-events-none absolute rounded-full bg-white/30"
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: r.size, height: r.size, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ left: r.x, top: r.y }}
          />
        ))}
      </motion.div>
    )
  }
)
PremiumButton.displayName = "PremiumButton"

export { PremiumButton, premiumButtonVariants }