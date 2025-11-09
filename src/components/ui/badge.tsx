import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[--color-brand-500] text-[--color-text-inverse]",
        secondary:
          "border-[--color-border] bg-[--color-surface] text-[--color-text-secondary]",
        accent:
          "border-transparent bg-[--color-accent-500] text-[--color-text-inverse]",
        success:
          "border-transparent bg-[--color-success-500] text-[--color-text-inverse]",
        warning:
          "border-transparent bg-[--color-warning-500] text-[--color-text-inverse]",
        error:
          "border-transparent bg-[--color-error-500] text-[--color-text-inverse]",
        outline:
          "border-[--color-border] text-[--color-text-secondary]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
