import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NetworkBadge } from "./NetworkBadge"
import { TokenIcon } from "./TokenIcon"
import { formatCurrency, truncateAddress, formatTokenAmount } from "@/lib/utils"
import { Wallet, RefreshCw, Trash2 } from "lucide-react"

interface TokenBalance {
  symbol: string
  amount: number
  usdValue: number
}

interface NetworkBalance {
  network: string
  nativeToken: TokenBalance
  tokens: TokenBalance[]
  totalValue: number
}

interface WalletCardProps {
  label?: string
  address: string
  chainFamily: string
  networks: NetworkBalance[]
  totalValue: number
  lastScanned: Date
  onRescan?: () => void
  onRemove?: () => void
}

export function WalletCard({
  label,
  address,
  chainFamily,
  networks,
  totalValue,
  lastScanned,
  onRescan,
  onRemove,
}: WalletCardProps) {
  const networksWithBalance = networks.filter(n => n.totalValue > 0)
  const networksWithoutBalance = networks.filter(n => n.totalValue === 0)

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds} seconds ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    const hours = Math.floor(minutes / 60)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[--color-brand-500] to-[--color-accent-500] flex items-center justify-center glow">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {label || "Unnamed Address"}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm text-[--color-text-secondary] font-mono">
                  {truncateAddress(address)}
                </code>
                <NetworkBadge network={chainFamily} />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gradient">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-xs text-[--color-text-tertiary] mt-1">
              Last scanned {getTimeAgo(lastScanned)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {networksWithBalance.map((network) => (
          <div
            key={network.network}
            className="border border-[--color-border] rounded-lg p-4 hover:border-[--color-border-hover] transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[--color-success-500]" />
                <span className="font-medium text-[--color-text-primary]">
                  {network.network}
                </span>
              </div>
              <span className="text-sm text-[--color-text-secondary]">
                {formatCurrency(network.totalValue)}
              </span>
            </div>

            <div className="space-y-2">
              {/* Native Token */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <TokenIcon symbol={network.nativeToken.symbol} size="sm" />
                  <div>
                    <div className="font-medium text-sm">
                      {network.nativeToken.symbol}
                    </div>
                    <div className="text-xs text-[--color-text-tertiary]">
                      {formatTokenAmount(network.nativeToken.amount, 4)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {formatCurrency(network.nativeToken.usdValue)}
                  </div>
                </div>
              </div>

              {/* ERC-20 Tokens */}
              {network.tokens.map((token) => (
                <div
                  key={token.symbol}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <TokenIcon symbol={token.symbol} size="sm" />
                    <div>
                      <div className="font-medium text-sm">
                        {token.symbol}
                      </div>
                      <div className="text-xs text-[--color-text-tertiary]">
                        {formatTokenAmount(token.amount)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatCurrency(token.usdValue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {networksWithoutBalance.length > 0 && (
          <div className="text-sm text-[--color-text-tertiary] text-center py-2 border border-dashed border-[--color-border] rounded-lg">
            ø {networksWithoutBalance.length} other network
            {networksWithoutBalance.length > 1 ? "s" : ""} (no balance found)
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={onRescan}
          >
            <RefreshCw className="w-4 h-4" />
            Rescan
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <Trash2 className="w-4 h-4" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
