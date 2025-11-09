import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import type { Network, ChainFamily } from "../../app/lib/types/network"

interface AddNetworkFormProps {
  onAdd: (network: Network) => void
  onCancel: () => void
}

export function AddNetworkForm({ onAdd, onCancel }: AddNetworkFormProps) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    chainId: "",
    rpcUrl: "",
    blockExplorerUrl: "",
    nativeTokenSymbol: "",
    nativeTokenDecimals: "18",
    nativeTokenCoingeckoId: "",
    chainFamily: "evm" as ChainFamily,
    multicallAddress: "",
  })

  const [error, setError] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.id || !formData.name || !formData.chainId || !formData.rpcUrl) {
      setError("Please fill in all required fields")
      return
    }

    // Validate chain ID is a number
    const chainId = parseInt(formData.chainId)
    if (isNaN(chainId)) {
      setError("Chain ID must be a valid number")
      return
    }

    // Validate RPC URL
    try {
      new URL(formData.rpcUrl)
    } catch {
      setError("RPC URL must be a valid URL")
      return
    }

    // Validate block explorer URL if provided
    if (formData.blockExplorerUrl) {
      try {
        new URL(formData.blockExplorerUrl)
      } catch {
        setError("Block Explorer URL must be a valid URL")
        return
      }
    }

    // Create network object
    const network: Network = {
      id: formData.id.toLowerCase().replace(/\s+/g, "-"),
      name: formData.name,
      chainId,
      rpcUrl: formData.rpcUrl,
      nativeToken: {
        symbol: formData.nativeTokenSymbol || "ETH",
        decimals: parseInt(formData.nativeTokenDecimals) || 18,
        coingeckoId: formData.nativeTokenCoingeckoId || "ethereum",
      },
      blockExplorerUrl: formData.blockExplorerUrl || formData.rpcUrl,
      multicallAddress: formData.multicallAddress || undefined,
      chainFamily: formData.chainFamily,
    }

    try {
      onAdd(network)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add network")
    }
  }

  return (
    <Card className="p-6 bg-[--color-surface-secondary] border-[--color-border]">
      <h3 className="text-lg font-semibold text-[--color-text-primary] mb-4">
        Add Custom Network
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">
            Network ID * <span className="text-xs text-[--color-text-tertiary]">(e.g., "avalanche", "bnb")</span>
          </label>
          <Input
            type="text"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            placeholder="avalanche"
            className="bg-[--color-surface-primary] border-[--color-border]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">
            Network Name *
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Avalanche"
            className="bg-[--color-surface-primary] border-[--color-border]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">
            Chain ID *
          </label>
          <Input
            type="number"
            value={formData.chainId}
            onChange={(e) => setFormData({ ...formData, chainId: e.target.value })}
            placeholder="43114"
            className="bg-[--color-surface-primary] border-[--color-border]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">
            RPC URL *
          </label>
          <Input
            type="url"
            value={formData.rpcUrl}
            onChange={(e) => setFormData({ ...formData, rpcUrl: e.target.value })}
            placeholder="https://api.avax.network/ext/bc/C/rpc"
            className="bg-[--color-surface-primary] border-[--color-border]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">
            Block Explorer URL
          </label>
          <Input
            type="url"
            value={formData.blockExplorerUrl}
            onChange={(e) => setFormData({ ...formData, blockExplorerUrl: e.target.value })}
            placeholder="https://snowtrace.io"
            className="bg-[--color-surface-primary] border-[--color-border]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">
              Native Token Symbol
            </label>
            <Input
              type="text"
              value={formData.nativeTokenSymbol}
              onChange={(e) => setFormData({ ...formData, nativeTokenSymbol: e.target.value })}
              placeholder="AVAX"
              className="bg-[--color-surface-primary] border-[--color-border]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">
              Token Decimals
            </label>
            <Input
              type="number"
              value={formData.nativeTokenDecimals}
              onChange={(e) => setFormData({ ...formData, nativeTokenDecimals: e.target.value })}
              placeholder="18"
              className="bg-[--color-surface-primary] border-[--color-border]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">
            CoinGecko ID <span className="text-xs text-[--color-text-tertiary]">(for price fetching)</span>
          </label>
          <Input
            type="text"
            value={formData.nativeTokenCoingeckoId}
            onChange={(e) => setFormData({ ...formData, nativeTokenCoingeckoId: e.target.value })}
            placeholder="avalanche-2"
            className="bg-[--color-surface-primary] border-[--color-border]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">
            Chain Family
          </label>
          <select
            value={formData.chainFamily}
            onChange={(e) => setFormData({ ...formData, chainFamily: e.target.value as ChainFamily })}
            className="w-full px-3 py-2 bg-[--color-surface-primary] border border-[--color-border] rounded-md text-[--color-text-primary]"
          >
            <option value="evm">EVM</option>
            <option value="bitcoin">Bitcoin</option>
            <option value="solana">Solana</option>
            <option value="polkadot">Polkadot</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">
            Multicall Address <span className="text-xs text-[--color-text-tertiary]">(optional, for batch requests)</span>
          </label>
          <Input
            type="text"
            value={formData.multicallAddress}
            onChange={(e) => setFormData({ ...formData, multicallAddress: e.target.value })}
            placeholder="0xcA11bde05977b3631167028862bE2a173976CA11"
            className="bg-[--color-surface-primary] border-[--color-border]"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            className="flex-1 bg-[--color-primary] hover:bg-[--color-primary-hover] text-white"
          >
            Add Network
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-[--color-border] text-[--color-text-secondary]"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
