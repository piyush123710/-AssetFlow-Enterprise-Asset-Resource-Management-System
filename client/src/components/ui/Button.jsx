import React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"

const buttonVariants = {
  default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20",
  destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  outline: "border border-white/10 bg-transparent hover:bg-white/5 text-slate-100",
  secondary: "bg-white/10 text-slate-100 hover:bg-white/20",
  ghost: "hover:bg-white/10 text-slate-100",
  link: "text-indigo-400 underline-offset-4 hover:underline",
}

const sizeVariants = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
}

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-slate-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        sizeVariants[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
