import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[--color-brand-500] text-[--color-text-inverse] hover:bg-[--color-brand-600] active:bg-[--color-brand-700] focus-visible:ring-[--color-brand-500] glow",
        secondary:
          "bg-[--color-surface] text-[--color-text-primary] border border-[--color-border] hover:bg-[--color-surface-hover] hover:border-[--color-border-hover] active:bg-[--color-surface-active]",
        accent:
          "bg-[--color-accent-500] text-[--color-text-inverse] hover:bg-[--color-accent-600] active:bg-[--color-accent-700] focus-visible:ring-[--color-accent-500] glow-accent",
        ghost:
          "hover:bg-[--color-surface-hover] active:bg-[--color-surface-active]",
        danger:
          "bg-[--color-error-500] text-[--color-text-inverse] hover:bg-[--color-error-600] active:bg-[--color-error-700] focus-visible:ring-[--color-error-500]",
        success:
          "bg-[--color-success-500] text-[--color-text-inverse] hover:bg-[--color-success-600] active:bg-[--color-success-700] focus-visible:ring-[--color-success-500]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
