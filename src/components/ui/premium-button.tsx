import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const premiumButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-bold uppercase tracking-wider ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-visible border-2",
  {
    variants: {
      variant: {
        gradient: "bg-gradient-to-r from-primary to-secondary text-primary-foreground border-border shadow-neo hover:shadow-neo-hover hover:translate-x-[-2px] hover:translate-y-[-2px]",
        glass: "bg-background/80 border-border text-foreground hover:bg-muted shadow-neo hover:shadow-neo-hover backdrop-blur-sm",
        glow: "bg-primary text-primary-foreground border-border shadow-[0_0_15px_rgba(204,255,0,0.5)] hover:shadow-[0_0_25px_rgba(204,255,0,0.7)]",
        aurora: "bg-gradient-to-r from-secondary to-accent text-white border-border shadow-neo hover:shadow-neo-hover",
        neon: "bg-neo-black border-neo-yellow text-neo-yellow hover:bg-neo-yellow hover:text-neo-black shadow-[4px_4px_0px_0px_#CCFF00] hover:shadow-[6px_6px_0px_0px_#CCFF00] transition-all",
        floating: "bg-accent text-accent-foreground border-border shadow-neo hover:shadow-neo-lg hover:-translate-y-1",
        shimmer: "bg-foreground text-background border-border relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-1000 shadow-neo",
        ghost: "border-transparent hover:bg-muted hover:text-foreground",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
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