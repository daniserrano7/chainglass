import { useState } from "react";
import type { TokenWithNetwork } from "~/lib/types/token";
import { getAllNetworks } from "~/lib/config/networks";
import { getAllTokensForNetwork } from "~/lib/config/tokens";
import {
  addCustomToken,
  removeCustomToken,
} from "~/lib/services/storage";

interface TokenManagerProps {
  onTokenAdded?: (token: TokenWithNetwork) => void;
}

export function TokenManager({ onTokenAdded }: TokenManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const networks = getAllNetworks();
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({
    networkId: networks.length > 0 ? networks[0].id : "",
    address: "",
    symbol: "",
    name: "",
    decimals: "18",
    coingeckoId: "",
    logoUrl: "",
  });
  const [error, setError] = useState<string>("");

  // Get tokens for all networks
  const networkTokens = networks.map((network) => ({
    network,
    tokens: getAllTokensForNetwork(network.id),
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!formData.networkId || !formData.address || !formData.symbol) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate address format (basic EVM check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.address)) {
      setError("Invalid token address format (must be a valid Ethereum address)");
      return;
    }

    // Validate decimals is a number
    const decimals = parseInt(formData.decimals);
    if (isNaN(decimals) || decimals < 0 || decimals > 255) {
      setError("Decimals must be a number between 0 and 255");
      return;
    }

    // Validate logo URL if provided
    if (formData.logoUrl) {
      try {
        new URL(formData.logoUrl);
      } catch {
        setError("Logo URL must be a valid URL");
        return;
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
    };

    try {
      addCustomToken(token);

      // Reset form
      setFormData({
        networkId: networks.length > 0 ? networks[0].id : "",
        address: "",
        symbol: "",
        name: "",
        decimals: "18",
        coingeckoId: "",
        logoUrl: "",
      });
      setError("");
      setShowAddForm(false);

      // Trigger a re-render
      setRefreshKey((prev) => prev + 1);

      // Notify parent component
      if (onTokenAdded) {
        onTokenAdded(token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add token");
    }
  };

  const handleRemoveToken = (
    address: string,
    networkId: string,
    isCustom: boolean
  ) => {
    if (!isCustom) {
      alert("Cannot remove default tokens");
      return;
    }

    if (confirm("Are you sure you want to remove this token?")) {
      try {
        removeCustomToken(address, networkId);

        // Trigger a re-render
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Failed to remove token:", error);
        alert("Failed to remove token");
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="token-manager" key={refreshKey}>
      <div className="token-header">
        <div>
          <h2>Token Manager</h2>
          <p className="subtitle">Manage ERC-20 tokens tracked on each network</p>
        </div>

        {!showAddForm && (
          <button className="btn-primary" onClick={() => setShowAddForm(true)}>
            + Add Token
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="add-token-form">
          <h3>Add Custom Token</h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Network *</label>
              <select
                value={formData.networkId}
                onChange={(e) =>
                  setFormData({ ...formData, networkId: e.target.value })
                }
                required
              >
                {networks.map((network) => (
                  <option key={network.id} value={network.id}>
                    {network.name} (Chain ID: {network.chainId})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Token Contract Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="0x..."
                required
              />
              <p className="hint">The contract address of the ERC-20 token</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Token Symbol *</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      symbol: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="USDC"
                  required
                />
              </div>

              <div className="form-group">
                <label>Decimals *</label>
                <input
                  type="number"
                  value={formData.decimals}
                  onChange={(e) =>
                    setFormData({ ...formData, decimals: e.target.value })
                  }
                  placeholder="18"
                  min="0"
                  max="255"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Token Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="USD Coin"
              />
            </div>

            <div className="form-group">
              <label>
                CoinGecko ID <span className="hint">(for price fetching)</span>
              </label>
              <input
                type="text"
                value={formData.coingeckoId}
                onChange={(e) =>
                  setFormData({ ...formData, coingeckoId: e.target.value })
                }
                placeholder="usd-coin"
              />
              <p className="hint">Find the ID on CoinGecko's token page URL</p>
            </div>

            <div className="form-group">
              <label>
                Logo URL <span className="hint">(optional)</span>
              </label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, logoUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Add Token
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

      <div className="token-networks">
        {networkTokens.map(({ network, tokens }) => {
          if (tokens.all.length === 0) return null;

          return (
            <div key={network.id} className="token-network">
              <h3>
                {network.name}
                <span className="count">({tokens.all.length} tokens)</span>
              </h3>
              <p className="network-info">Chain ID: {network.chainId}</p>

              <div className="token-grid">
                {tokens.all.map((token) => (
                  <div key={token.address} className="token-card">
                    <div className="token-card-header">
                      <div>
                        <h4>
                          {token.symbol}
                          {token.isCustom && (
                            <span className="custom-badge">Custom</span>
                          )}
                        </h4>
                        {token.name && <p className="token-name">{token.name}</p>}
                      </div>

                      {token.isCustom && (
                        <button
                          className="remove-btn"
                          onClick={() =>
                            handleRemoveToken(
                              token.address,
                              network.id,
                              token.isCustom
                            )
                          }
                          title="Remove token"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="token-details">
                      <div className="detail-row">
                        <span className="label">Address:</span>
                        <code className="value">
                          {formatAddress(token.address)}
                        </code>
                      </div>

                      <div className="detail-row">
                        <span className="label">Decimals:</span>
                        <span className="value">{token.decimals}</span>
                      </div>

                      {token.coingeckoId && (
                        <div className="price-tracking">
                          <span>💰</span>
                          <span>Price tracking enabled</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {networkTokens.every((nt) => nt.tokens.all.length === 0) && (
        <div className="empty-tokens">
          <p>No tokens configured. Add your first token to get started.</p>
        </div>
      )}

      <style>{`
        .token-manager {
          margin-bottom: 32px;
        }

        .token-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .token-header h2 {
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

        .add-token-form {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .add-token-form h3 {
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
          margin-top: 4px;
          display: block;
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

        .token-networks {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .token-network {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
        }

        .token-network h3 {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .token-network .count {
          font-size: 14px;
          font-weight: 400;
          color: #6b7280;
        }

        .network-info {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 16px;
        }

        .token-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 12px;
        }

        .token-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          transition: border-color 0.2s;
        }

        .token-card:hover {
          border-color: #3b82f6;
        }

        .token-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .token-card h4 {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
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

        .token-name {
          font-size: 12px;
          color: #6b7280;
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

        .token-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-row {
          display: flex;
          justify-between;
          font-size: 12px;
        }

        .detail-row .label {
          color: #6b7280;
        }

        .detail-row .value {
          color: #111827;
          font-weight: 500;
          font-family: monospace;
        }

        .price-tracking {
          padding-top: 8px;
          border-top: 1px solid #e5e7eb;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
        }

        .empty-tokens {
          background: white;
          border: 2px dashed #e5e7eb;
          border-radius: 12px;
          padding: 48px 24px;
          text-align: center;
        }

        .empty-tokens p {
          color: #6b7280;
          font-size: 16px;
        }

        /* Mobile-first responsive adjustments */
        @media (max-width: 639px) {
          .token-manager {
            margin-bottom: 16px;
          }

          .token-header {
            flex-direction: column;
            gap: 12px;
            margin-bottom: 16px;
          }

          .token-header h2 {
            font-size: 18px;
          }

          .subtitle {
            font-size: 13px;
          }

          .btn-primary {
            width: 100%;
            min-height: 48px;
            padding: 12px 20px;
          }

          .add-token-form {
            padding: 16px;
            margin-bottom: 16px;
          }

          .add-token-form h3 {
            font-size: 17px;
            margin-bottom: 16px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-group input,
          .form-group select {
            font-size: 16px;
            padding: 12px;
            min-height: 44px;
          }

          .form-group .hint {
            font-size: 11px;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .form-actions button {
            width: 100%;
            min-height: 48px;
          }

          .token-network {
            padding: 16px;
          }

          .token-network h3 {
            font-size: 17px;
            margin-bottom: 12px;
          }

          .network-info {
            font-size: 11px;
            margin-bottom: 12px;
          }

          .token-grid {
            grid-template-columns: 1fr;
          }

          .token-card {
            padding: 14px;
          }

          .token-card h4 {
            font-size: 15px;
          }

          .token-name {
            font-size: 11px;
          }

          .detail-row {
            font-size: 11px;
          }

          .price-tracking {
            font-size: 11px;
          }
        }

        @media (min-width: 640px) {
          .btn-primary {
            width: auto;
          }

          .form-actions {
            flex-direction: row;
          }

          .form-actions button {
            width: auto;
          }

          .token-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          }
        }

        @media (min-width: 768px) {
          .token-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
          }

          .token-grid {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
