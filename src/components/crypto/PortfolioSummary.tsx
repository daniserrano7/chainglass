import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, Wallet, Network } from "lucide-react"

interface PortfolioSummaryProps {
  totalValue: number
  addressCount: number
  networkCount: number
}

export function PortfolioSummary({
  totalValue,
  addressCount,
  networkCount,
}: PortfolioSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="gradient-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[--color-brand-500] flex items-center justify-center glow">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm text-[--color-text-secondary]">
              Total Portfolio
            </div>
          </div>
          <div className="text-3xl font-bold text-gradient">
            {formatCurrency(totalValue)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[--color-accent-500] flex items-center justify-center glow-accent">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm text-[--color-text-secondary]">
              Tracked Addresses
            </div>
          </div>
          <div className="text-3xl font-bold">{addressCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[--color-success-500] flex items-center justify-center">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm text-[--color-text-secondary]">
              Active Networks
            </div>
          </div>
          <div className="text-3xl font-bold">{networkCount}</div>
        </CardContent>
      </Card>
    </div>
  )
}
