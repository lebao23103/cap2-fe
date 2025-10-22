import * as React from "react"
import { cn } from "@/lib/utils"

interface AnimatedBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "aurora" | "mesh" | "orbs" | "particles"
}

export function AnimatedBackground({ variant = "aurora", className, ...props }: AnimatedBackgroundProps) {
  if (variant === "mesh") {
    return (
      <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-0 -z-10", className)}
        {...props}
      >
        <div className="absolute inset-0 bg-mesh-gradient" />
      </div>
    )
  }

  if (variant === "orbs") {
    return (
      <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)} {...props}>
        <div className="absolute w-64 h-64 rounded-full bg-purple-500/20 blur-3xl -top-10 -left-10 animate-float" />
        <div className="absolute w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl top-20 right-0 animate-float animation-delay-2000" />
        <div className="absolute w-56 h-56 rounded-full bg-pink-500/20 blur-3xl bottom-0 left-10 animate-float animation-delay-4000" />
      </div>
    )
  }

  if (variant === "particles") {
    return (
      <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 particles-bg", className)} {...props} />
    )
  }

  // Default: aurora
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)} {...props}>
      <div
        className="absolute -inset-20 animate-aurora"
        style={{
          background:
            "radial-gradient(30% 30% at 20% 20%, rgba(99,102,241,0.25), transparent), radial-gradient(35% 35% at 80% 30%, rgba(168,85,247,0.2), transparent), radial-gradient(35% 35% at 50% 80%, rgba(236,72,153,0.15), transparent)",
          filter: "blur(40px)",
        }}
      />
    </div>
  )
}
