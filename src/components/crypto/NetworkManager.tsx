import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { NetworkBadge } from "./NetworkBadge"
import { AddNetworkForm } from "./AddNetworkForm"
import type { Network } from "../../app/lib/types/network"
import { getNetworksByFamily } from "../../app/lib/config/networks"
import { addCustomNetwork, removeCustomNetwork, getCustomNetworks } from "../../app/lib/services/storage"

interface NetworkManagerProps {
  onNetworkAdded?: (network: Network) => void
}

export function NetworkManager({ onNetworkAdded }: NetworkManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [networks, setNetworks] = useState<Record<string, Network[]>>(() => getNetworksByFamily())
  const [customNetworkIds, setCustomNetworkIds] = useState<Set<string>>(() => {
    const customNets = getCustomNetworks()
    return new Set(customNets.map((n) => n.id))
  })

  const handleAddNetwork = (network: Network) => {
    try {
      addCustomNetwork(network)

      // Update local state
      const updatedNetworks = getNetworksByFamily()
      setNetworks(updatedNetworks)

      // Add to custom network IDs
      setCustomNetworkIds((prev) => new Set([...prev, network.id]))

      setShowAddForm(false)

      // Notify parent component
      if (onNetworkAdded) {
        onNetworkAdded(network)
      }
    } catch (error) {
      throw error
    }
  }

  const handleRemoveNetwork = (networkId: string) => {
    if (!customNetworkIds.has(networkId)) {
      alert("Cannot remove default networks")
      return
    }

    if (confirm("Are you sure you want to remove this network?")) {
      try {
        removeCustomNetwork(networkId)

        // Update local state
        const updatedNetworks = getNetworksByFamily()
        setNetworks(updatedNetworks)

        // Remove from custom network IDs
        setCustomNetworkIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(networkId)
          return newSet
        })
      } catch (error) {
        console.error("Failed to remove network:", error)
        alert("Failed to remove network")
      }
    }
  }

  const familyNames: Record<string, string> = {
    evm: "EVM Compatible Networks",
    bitcoin: "Bitcoin Networks",
    solana: "Solana Networks",
    polkadot: "Polkadot Networks",
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[--color-text-primary]">
            Network Manager
          </h2>
          <p className="text-sm text-[--color-text-secondary] mt-1">
            Manage all blockchain networks and families
          </p>
        </div>

        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-[--color-primary] hover:bg-[--color-primary-hover] text-white"
          >
            + Add Network
          </Button>
        )}
      </div>

      {showAddForm && (
        <AddNetworkForm
          onAdd={handleAddNetwork}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="space-y-6">
        {Object.entries(networks).map(([family, familyNetworks]) => (
          <Card key={family} className="p-6 bg-[--color-surface-secondary] border-[--color-border]">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[--color-text-primary] flex items-center gap-2">
                {familyNames[family] || `${family.toUpperCase()} Networks`}
                <span className="text-sm font-normal text-[--color-text-tertiary]">
                  ({familyNetworks.length})
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyNetworks.map((network) => {
                const isCustom = customNetworkIds.has(network.id)

                return (
                  <div
                    key={network.id}
                    className="p-4 bg-[--color-surface-primary] border border-[--color-border] rounded-lg hover:border-[--color-primary] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-[--color-text-primary]">
                            {network.name}
                          </h4>
                          {isCustom && (
                            <span className="px-2 py-0.5 bg-[--color-primary]/20 text-[--color-primary] text-xs rounded">
                              Custom
                            </span>
                          )}
                        </div>
                        <NetworkBadge network={network.name} className="text-xs" />
                      </div>

                      {isCustom && (
                        <button
                          onClick={() => handleRemoveNetwork(network.id)}
                          className="text-red-400 hover:text-red-300 text-sm ml-2"
                          title="Remove network"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[--color-text-tertiary]">Chain ID:</span>
                        <span className="text-[--color-text-primary] font-mono">
                          {network.chainId}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[--color-text-tertiary]">Native Token:</span>
                        <span className="text-[--color-text-primary] font-medium">
                          {network.nativeToken.symbol}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-[--color-border]">
                        <a
                          href={network.blockExplorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[--color-primary] hover:text-[--color-primary-hover] text-xs flex items-center gap-1"
                        >
                          Block Explorer →
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        ))}
      </div>

      {Object.keys(networks).length === 0 && (
        <Card className="p-12 bg-[--color-surface-secondary] border-[--color-border] text-center">
          <p className="text-[--color-text-secondary]">
            No networks configured. Add your first network to get started.
          </p>
        </Card>
      )}
    </div>
  )
}
