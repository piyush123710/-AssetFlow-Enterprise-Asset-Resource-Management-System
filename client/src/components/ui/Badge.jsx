import React from "react"
import { cn } from "../../lib/utils"

const badgeVariants = {
  default: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  secondary: "bg-white/10 text-slate-100 border-white/10",
  destructive: "bg-red-500/10 text-red-400 border-red-500/20",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  outline: "text-slate-100 border-white/20",
}

function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
