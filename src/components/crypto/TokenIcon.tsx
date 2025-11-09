import { cn } from "@/lib/utils"

interface TokenIconProps {
  symbol: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-12 h-12 text-base",
}

// Placeholder token icon component
// In a real app, you'd fetch actual token logos from CoinGecko or a token list
export function TokenIcon({ symbol, size = "md", className }: TokenIconProps) {
  const firstLetter = symbol.charAt(0).toUpperCase()

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold",
        "bg-gradient-to-br from-[--color-brand-500] to-[--color-accent-500]",
        "text-white",
        sizeClasses[size],
        className
      )}
    >
      {firstLetter}
    </div>
  )
}
