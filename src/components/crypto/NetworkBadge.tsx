import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface NetworkBadgeProps {
  network: string
  className?: string
}

const networkColors: Record<string, string> = {
  ethereum: "bg-[#627eea] border-[#627eea]",
  polygon: "bg-[#8247e5] border-[#8247e5]",
  arbitrum: "bg-[#28a0f0] border-[#28a0f0]",
  optimism: "bg-[#ff0420] border-[#ff0420]",
  base: "bg-[#0052ff] border-[#0052ff]",
  avalanche: "bg-[#e84142] border-[#e84142]",
  bnb: "bg-[#f3ba2f] border-[#f3ba2f]",
}

export function NetworkBadge({ network, className }: NetworkBadgeProps) {
  const networkName = network.toLowerCase()
  const colorClass = networkColors[networkName] || "bg-[--color-text-tertiary] border-[--color-text-tertiary]"

  return (
    <Badge
      variant="default"
      className={cn(
        "text-white font-medium",
        colorClass,
        className
      )}
    >
      {network}
    </Badge>
  )
}
