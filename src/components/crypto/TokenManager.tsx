import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AddTokenForm } from "./AddTokenForm"
import type { TokenWithNetwork } from "../../app/lib/types/token"
import { getAllNetworks } from "../../app/lib/config/networks"
import { getAllTokensForNetwork } from "../../app/lib/config/tokens"
import { addCustomToken, removeCustomToken } from "../../app/lib/services/storage"

interface TokenManagerProps {
  onTokenAdded?: (token: TokenWithNetwork) => void
}

export function TokenManager({ onTokenAdded }: TokenManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const networks = getAllNetworks()
  const [refreshKey, setRefreshKey] = useState(0)

  // Get tokens for all networks
  const networkTokens = networks.map((network) => ({
    network,
    tokens: getAllTokensForNetwork(network.id),
  }))

  const handleAddToken = (token: TokenWithNetwork) => {
    try {
      addCustomToken(token)

      // Trigger a re-render
      setRefreshKey((prev) => prev + 1)
      setShowAddForm(false)

      // Notify parent component
      if (onTokenAdded) {
        onTokenAdded(token)
      }
    } catch (error) {
      throw error
    }
  }

  const handleRemoveToken = (address: string, networkId: string, isCustom: boolean) => {
    if (!isCustom) {
      alert("Cannot remove default tokens")
      return
    }

    if (confirm("Are you sure you want to remove this token?")) {
      try {
        removeCustomToken(address, networkId)

        // Trigger a re-render
        setRefreshKey((prev) => prev + 1)
      } catch (error) {
        console.error("Failed to remove token:", error)
        alert("Failed to remove token")
      }
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="space-y-6" key={refreshKey}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[--color-text-primary]">
            Token Manager
          </h2>
          <p className="text-sm text-[--color-text-secondary] mt-1">
            Manage ERC-20 tokens tracked on each network
          </p>
        </div>

        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-[--color-primary] hover:bg-[--color-primary-hover] text-white"
          >
            + Add Token
          </Button>
        )}
      </div>

      {showAddForm && (
        <AddTokenForm
          onAdd={handleAddToken}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="space-y-6">
        {networkTokens.map(({ network, tokens }) => {
          if (tokens.all.length === 0) return null

          return (
            <Card
              key={network.id}
              className="p-6 bg-[--color-surface-secondary] border-[--color-border]"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-[--color-text-primary] flex items-center gap-2">
                  {network.name}
                  <span className="text-sm font-normal text-[--color-text-tertiary]">
                    ({tokens.all.length} tokens)
                  </span>
                </h3>
                <p className="text-xs text-[--color-text-tertiary] mt-1">
                  Chain ID: {network.chainId}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tokens.all.map((token) => (
                  <div
                    key={token.address}
                    className="p-4 bg-[--color-surface-primary] border border-[--color-border] rounded-lg hover:border-[--color-primary] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-[--color-text-primary]">
                            {token.symbol}
                          </h4>
                          {token.isCustom && (
                            <span className="px-2 py-0.5 bg-[--color-primary]/20 text-[--color-primary] text-xs rounded">
                              Custom
                            </span>
                          )}
                        </div>
                        {token.name && (
                          <p className="text-xs text-[--color-text-tertiary]">
                            {token.name}
                          </p>
                        )}
                      </div>

                      {token.isCustom && (
                        <button
                          onClick={() =>
                            handleRemoveToken(token.address, network.id, token.isCustom)
                          }
                          className="text-red-400 hover:text-red-300 text-sm ml-2"
                          title="Remove token"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[--color-text-tertiary]">Address:</span>
                        <code className="text-[--color-text-primary] font-mono">
                          {formatAddress(token.address)}
                        </code>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[--color-text-tertiary]">Decimals:</span>
                        <span className="text-[--color-text-primary] font-medium">
                          {token.decimals}
                        </span>
                      </div>

                      {token.coingeckoId && (
                        <div className="pt-1.5 border-t border-[--color-border]">
                          <div className="flex items-center gap-1 text-[--color-text-tertiary]">
                            <span>💰</span>
                            <span>Price tracking enabled</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>

      {networkTokens.every((nt) => nt.tokens.all.length === 0) && (
        <Card className="p-12 bg-[--color-surface-secondary] border-[--color-border] text-center">
          <p className="text-[--color-text-secondary]">
            No tokens configured. Add your first token to get started.
          </p>
        </Card>
      )}
    </div>
  )
}
