import { useState } from "react";
import type { Network } from "~/lib/types/network";
import { getNetworksByFamily } from "~/lib/config/networks";
import {
  addCustomNetwork,
  removeCustomNetwork,
  getCustomNetworks,
} from "~/lib/services/storage";

interface NetworkManagerProps {
  onNetworkAdded?: (network: Network) => void;
}

export function NetworkManager({ onNetworkAdded }: NetworkManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [networks, setNetworks] = useState<Record<string, Network[]>>(() =>
    getNetworksByFamily()
  );
  const [customNetworkIds, setCustomNetworkIds] = useState<Set<string>>(() => {
    const customNets = getCustomNetworks();
    return new Set(customNets.map((n) => n.id));
  });
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    chainId: "",
    rpcUrl: "",
    blockExplorerUrl: "",
    nativeTokenSymbol: "",
    nativeTokenDecimals: "18",
    nativeTokenCoingeckoId: "",
    chainFamily: "evm" as const,
    multicallAddress: "",
  });
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!formData.id || !formData.name || !formData.chainId || !formData.rpcUrl) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate chain ID is a number
    const chainId = parseInt(formData.chainId);
    if (isNaN(chainId)) {
      setError("Chain ID must be a valid number");
      return;
    }

    // Validate RPC URL
    try {
      new URL(formData.rpcUrl);
    } catch {
      setError("RPC URL must be a valid URL");
      return;
    }

    // Validate block explorer URL if provided
    if (formData.blockExplorerUrl) {
      try {
        new URL(formData.blockExplorerUrl);
      } catch {
        setError("Block Explorer URL must be a valid URL");
        return;
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
    };

    try {
      addCustomNetwork(network);

      // Update local state
      const updatedNetworks = getNetworksByFamily();
      setNetworks(updatedNetworks);

      // Add to custom network IDs
      setCustomNetworkIds((prev) => new Set([...prev, network.id]));

      // Reset form
      setFormData({
        id: "",
        name: "",
        chainId: "",
        rpcUrl: "",
        blockExplorerUrl: "",
        nativeTokenSymbol: "",
        nativeTokenDecimals: "18",
        nativeTokenCoingeckoId: "",
        chainFamily: "evm",
        multicallAddress: "",
      });
      setShowAddForm(false);

      // Notify parent component
      if (onNetworkAdded) {
        onNetworkAdded(network);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add network");
    }
  };

  const handleRemoveNetwork = (networkId: string) => {
    if (!customNetworkIds.has(networkId)) {
      alert("Cannot remove default networks");
      return;
    }

    if (confirm("Are you sure you want to remove this network?")) {
      try {
        removeCustomNetwork(networkId);

        // Update local state
        const updatedNetworks = getNetworksByFamily();
        setNetworks(updatedNetworks);

        // Remove from custom network IDs
        setCustomNetworkIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(networkId);
          return newSet;
        });
      } catch (error) {
        console.error("Failed to remove network:", error);
        alert("Failed to remove network");
      }
    }
  };

  const familyNames: Record<string, string> = {
    evm: "EVM Compatible Networks",
    bitcoin: "Bitcoin Networks",
    solana: "Solana Networks",
    polkadot: "Polkadot Networks",
  };

  return (
    <div className="network-manager">
      <div className="network-header">
        <div>
          <h2>Network Manager</h2>
          <p className="subtitle">Manage all blockchain networks and families</p>
        </div>

        {!showAddForm && (
          <button className="btn-primary" onClick={() => setShowAddForm(true)}>
            + Add Network
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="add-network-form">
          <h3>Add Custom Network</h3>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>
                  Network ID * <span className="hint">(e.g., "avalanche", "bnb")</span>
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                  placeholder="avalanche"
                  required
                />
              </div>

              <div className="form-group">
                <label>Network Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Avalanche"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Chain ID *</label>
                <input
                  type="number"
                  value={formData.chainId}
                  onChange={(e) =>
                    setFormData({ ...formData, chainId: e.target.value })
                  }
                  placeholder="43114"
                  required
                />
              </div>

              <div className="form-group">
                <label>Chain Family</label>
                <select
                  value={formData.chainFamily}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      chainFamily: e.target.value as any,
                    })
                  }
                >
                  <option value="evm">EVM</option>
                  <option value="bitcoin">Bitcoin</option>
                  <option value="solana">Solana</option>
                  <option value="polkadot">Polkadot</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>RPC URL *</label>
              <input
                type="url"
                value={formData.rpcUrl}
                onChange={(e) =>
                  setFormData({ ...formData, rpcUrl: e.target.value })
                }
                placeholder="https://api.avax.network/ext/bc/C/rpc"
                required
              />
            </div>

            <div className="form-group">
              <label>Block Explorer URL</label>
              <input
                type="url"
                value={formData.blockExplorerUrl}
                onChange={(e) =>
                  setFormData({ ...formData, blockExplorerUrl: e.target.value })
                }
                placeholder="https://snowtrace.io"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Native Token Symbol</label>
                <input
                  type="text"
                  value={formData.nativeTokenSymbol}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nativeTokenSymbol: e.target.value,
                    })
                  }
                  placeholder="AVAX"
                />
              </div>

              <div className="form-group">
                <label>Token Decimals</label>
                <input
                  type="number"
                  value={formData.nativeTokenDecimals}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nativeTokenDecimals: e.target.value,
                    })
                  }
                  placeholder="18"
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                CoinGecko ID <span className="hint">(for price fetching)</span>
              </label>
              <input
                type="text"
                value={formData.nativeTokenCoingeckoId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nativeTokenCoingeckoId: e.target.value,
                  })
                }
                placeholder="avalanche-2"
              />
            </div>

            <div className="form-group">
              <label>
                Multicall Address{" "}
                <span className="hint">(optional, for batch requests)</span>
              </label>
              <input
                type="text"
                value={formData.multicallAddress}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    multicallAddress: e.target.value,
                  })
                }
                placeholder="0xcA11bde05977b3631167028862bE2a173976CA11"
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Add Network
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setError("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="network-families">
        {Object.entries(networks).map(([family, familyNetworks]) => (
          <div key={family} className="network-family">
            <h3>
              {familyNames[family] || `${family.toUpperCase()} Networks`}
              <span className="count">({familyNetworks.length})</span>
            </h3>

            <div className="network-grid">
              {familyNetworks.map((network) => {
                const isCustom = customNetworkIds.has(network.id);

                return (
                  <div key={network.id} className="network-card">
                    <div className="network-card-header">
                      <div>
                        <h4>
                          {network.name}
                          {isCustom && <span className="custom-badge">Custom</span>}
                        </h4>
                        <div className="network-badge">{network.name}</div>
                      </div>

                      {isCustom && (
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveNetwork(network.id)}
                          title="Remove network"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="network-details">
                      <div className="detail-row">
                        <span className="label">Chain ID:</span>
                        <span className="value">{network.chainId}</span>
                      </div>

                      <div className="detail-row">
                        <span className="label">Native Token:</span>
                        <span className="value">
                          {network.nativeToken.symbol}
                        </span>
                      </div>

                      <div className="detail-link">
                        <a
                          href={network.blockExplorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Block Explorer →
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(networks).length === 0 && (
        <div className="empty-networks">
          <p>No networks configured. Add your first network to get started.</p>
        </div>
      )}

      <style>{`
        .network-manager {
          margin-bottom: 32px;
        }

        .network-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .network-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }

        .subtitle {
          font-size: 14px;
          color: #6b7280;
        }

        .btn-primary {
          background-color: #3b82f6;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-primary:hover {
          background-color: #2563eb;
        }

        .btn-secondary {
          background-color: white;
          color: #374151;
          border: 1px solid #d1d5db;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-secondary:hover {
          background-color: #f9fafb;
        }

        .add-network-form {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .add-network-form h3 {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .form-group .hint {
          font-size: 12px;
          font-weight: 400;
          color: #6b7280;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          color: #111827;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .form-error {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .form-actions button {
          flex: 1;
        }

        .network-families {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .network-family {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
        }

        .network-family h3 {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .network-family .count {
          font-size: 14px;
          font-weight: 400;
          color: #6b7280;
        }

        .network-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .network-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          transition: border-color 0.2s;
        }

        .network-card:hover {
          border-color: #3b82f6;
        }

        .network-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .network-card h4 {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .custom-badge {
          background-color: #dbeafe;
          color: #3b82f6;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .network-badge {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .remove-btn {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 18px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .remove-btn:hover {
          background-color: rgba(239, 68, 68, 0.1);
        }

        .network-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .detail-row .label {
          color: #6b7280;
        }

        .detail-row .value {
          color: #111827;
          font-weight: 500;
          font-family: monospace;
        }

        .detail-link {
          padding-top: 8px;
          border-top: 1px solid #e5e7eb;
          margin-top: 4px;
        }

        .detail-link a {
          color: #3b82f6;
          font-size: 12px;
          text-decoration: none;
          transition: color 0.2s;
        }

        .detail-link a:hover {
          color: #2563eb;
        }

        .empty-networks {
          background: white;
          border: 2px dashed #e5e7eb;
          border-radius: 12px;
          padding: 48px 24px;
          text-align: center;
        }

        .empty-networks p {
          color: #6b7280;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .network-header {
            flex-direction: column;
            gap: 16px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .network-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
