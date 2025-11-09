import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import type { TokenWithNetwork } from "../../app/lib/types/token"
import { getAllNetworks } from "../../app/lib/config/networks"

interface AddTokenFormProps {
  onAdd: (token: TokenWithNetwork) => void
  onCancel: () => void
}

export function AddTokenForm({ onAdd, onCancel }: AddTokenFormProps) {
  const networks = getAllNetworks()
  const [formData, setFormData] = useState({
    networkId: networks.length > 0 ? networks[0].id : "",
    address: "",
    symbol: "",
    name: "",
    decimals: "18",
    coingeckoId: "",
    logoUrl: "",
  })

  const [error, setError] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.networkId || !formData.address || !formData.symbol) {
      setError("Please fill in all required fields")
      return
    }

    // Validate address format (basic EVM check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.address)) {
      setError("Invalid token address format (must be a valid Ethereum address)")
      return
    }

    // Validate decimals is a number
    const decimals = parseInt(formData.decimals)
    if (isNaN(decimals) || decimals < 0 || decimals > 255) {
      setError("Decimals must be a number between 0 and 255")
      return
    }

    // Validate logo URL if provided
    if (formData.logoUrl) {
      try {
        new URL(formData.logoUrl)
      } catch {
        setError("Logo URL must be a valid URL")
        return
      }
    }

    // Create token object
    const token: TokenWithNetwork = {
      networkId: formData.networkId,
      address: formData.address,
      symbol: formData.symbol.toUpperCase(),
      name: formData.name || formData.symbol,
      decimals,
      coingeckoId: formData.coingeckoId || undefined,
      logoUrl: formData.logoUrl || undefined,
      isCustom: true,
    }

    try {
      onAdd(token)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add token")
    }
  }

  return (
    <Card className="p-6 bg-[--color-surface-secondary] border-[--color-border]">
      <h3 className="text-lg font-semibold text-[--color-text-primary] mb-4">
        Add Custom Token
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">
            Network *
          </label>
          <select
            value={formData.networkId}
            onChange={(e) => setFormData({ ...formData, networkId: e.target.value })}
            className="w-full px-3 py-2 bg-[--color-surface-primary] border border-[--color-border] rounded-md text-[--color-text-primary]"
            required
          >
            {networks.map((network) => (
              <option key={network.id} value={network.id}>
                {network.name} (Chain ID: {network.chainId})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">
            Token Contract Address *
          </label>
          <Input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="0x..."
            className="bg-[--color-surface-primary] border-[--color-border] font-mono"
            required
          />
          <p className="text-xs text-[--color-text-tertiary] mt-1">
            The contract address of the ERC-20 token
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">
              Token Symbol *
            </label>
            <Input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              placeholder="USDC"
              className="bg-[--color-surface-primary] border-[--color-border]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">
              Decimals *
            </label>
            <Input
              type="number"
              value={formData.decimals}
              onChange={(e) => setFormData({ ...formData, decimals: e.target.value })}
              placeholder="18"
              min="0"
              max="255"
              className="bg-[--color-surface-primary] border-[--color-border]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">
            Token Name
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="USD Coin"
            className="bg-[--color-surface-primary] border-[--color-border]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">
            CoinGecko ID <span className="text-xs text-[--color-text-tertiary]">(for price fetching)</span>
          </label>
          <Input
            type="text"
            value={formData.coingeckoId}
            onChange={(e) => setFormData({ ...formData, coingeckoId: e.target.value })}
            placeholder="usd-coin"
            className="bg-[--color-surface-primary] border-[--color-border]"
          />
          <p className="text-xs text-[--color-text-tertiary] mt-1">
            Find the ID on CoinGecko's token page URL
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">
            Logo URL <span className="text-xs text-[--color-text-tertiary]">(optional)</span>
          </label>
          <Input
            type="url"
            value={formData.logoUrl}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            placeholder="https://..."
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
            Add Token
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
