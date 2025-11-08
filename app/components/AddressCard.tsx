import { useState } from "react";
import type { AddressPortfolio } from "~/lib/types";
import { truncateAddress } from "~/lib/types/address";
import { formatUsdValue, formatTokenAmount } from "~/lib/services";

interface AddressCardProps {
  portfolio: AddressPortfolio;
  onRescan: (addressId: string) => void;
  onRemove: (addressId: string) => void;
  isScanning?: boolean;
}

export function AddressCard({
  portfolio,
  onRescan,
  onRemove,
  isScanning = false,
}: AddressCardProps) {
  const [showNoBalance, setShowNoBalance] = useState(false);

  const networksWithBalance = portfolio.networkBalances.filter(
    (nb) => nb.hasBalance
  );
  const networksWithoutBalance = portfolio.networkBalances.filter(
    (nb) => !nb.hasBalance && !nb.error
  );
  const networksWithErrors = portfolio.networkBalances.filter(
    (nb) => nb.error
  );

  const handleRemove = () => {
    if (confirm(`Are you sure you want to remove this address?`)) {
      onRemove(portfolio.addressId);
    }
  };

  return (
    <div className="address-card">
      <div className="card-header">
        <div className="address-info">
          <div className="address-label">
            {portfolio.label || "Unnamed Address"}
          </div>
          <div className="address-value" title={portfolio.address}>
            {truncateAddress(portfolio.address)} <span className="chain-badge">EVM</span>
          </div>
          <div className="last-scanned">
            Last scanned: {new Date(portfolio.lastScanned).toLocaleString()}
          </div>
        </div>
        <div className="address-total">
          <div className="total-label">Address Total</div>
          <div className="total-value">{formatUsdValue(portfolio.totalUsdValue)}</div>
        </div>
      </div>

      {/* Networks with balance */}
      {networksWithBalance.length > 0 && (
        <div className="networks-section">
          {networksWithBalance.map((networkBalance) => (
            <div key={networkBalance.networkId} className="network-group">
              <div className="network-header">
                <span className="network-name">✓ {networkBalance.networkName}</span>
                <span className="network-total">
                  {formatUsdValue(networkBalance.totalUsdValue)}
                </span>
              </div>

              {/* Native balance */}
              {networkBalance.nativeBalance && (
                <div className="balance-row">
                  <span className="balance-symbol">
                    {networkBalance.nativeBalance.symbol}
                  </span>
                  <span className="balance-amount">
                    {formatTokenAmount(
                      networkBalance.nativeBalance.formattedAmount,
                      networkBalance.nativeBalance.decimals
                    )}
                  </span>
                  <span className="balance-usd">
                    {formatUsdValue(networkBalance.nativeBalance.usdValue)}
                  </span>
                </div>
              )}

              {/* Token balances */}
              {networkBalance.tokenBalances.map((token, idx) => (
                <div key={idx} className="balance-row">
                  <span className="balance-symbol">{token.symbol}</span>
                  <span className="balance-amount">
                    {formatTokenAmount(token.formattedAmount, token.decimals)}
                  </span>
                  <span className="balance-usd">
                    {formatUsdValue(token.usdValue)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Networks with errors */}
      {networksWithErrors.length > 0 && (
        <div className="errors-section">
          {networksWithErrors.map((networkBalance) => (
            <div key={networkBalance.networkId} className="error-item">
              ⚠️ {networkBalance.networkName}: {networkBalance.error}
            </div>
          ))}
        </div>
      )}

      {/* Networks without balance (collapsed) */}
      {networksWithoutBalance.length > 0 && (
        <div className="no-balance-section">
          <button
            className="toggle-no-balance"
            onClick={() => setShowNoBalance(!showNoBalance)}
          >
            ø {networksWithoutBalance.length} other network
            {networksWithoutBalance.length !== 1 ? "s" : ""} (no balance found)
            <span className="toggle-icon">{showNoBalance ? "▲" : "▼"}</span>
          </button>
          {showNoBalance && (
            <div className="no-balance-list">
              {networksWithoutBalance.map((nb) => (
                <div key={nb.networkId} className="no-balance-item">
                  {nb.networkName}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Zero balance state */}
      {networksWithBalance.length === 0 && networksWithErrors.length === 0 && (
        <div className="zero-balance-state">
          No balances found on any scanned network
        </div>
      )}

      {/* Action buttons */}
      <div className="card-actions">
        <button
          className="btn-secondary"
          onClick={() => onRescan(portfolio.addressId)}
          disabled={isScanning}
        >
          {isScanning ? "Rescanning..." : "Rescan"}
        </button>
        <button className="btn-danger" onClick={handleRemove} disabled={isScanning}>
          Remove
        </button>
      </div>

      <style>{`
        .address-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f3f4f6;
        }

        .address-info {
          flex: 1;
        }

        .address-label {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .address-value {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .chain-badge {
          display: inline-block;
          padding: 2px 8px;
          background-color: #dbeafe;
          color: #1e40af;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          margin-left: 8px;
        }

        .last-scanned {
          font-size: 12px;
          color: #9ca3af;
        }

        .address-total {
          text-align: right;
        }

        .total-label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .total-value {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }

        .networks-section {
          margin-bottom: 16px;
        }

        .network-group {
          margin-bottom: 16px;
        }

        .network-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background-color: #f9fafb;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .network-name {
          font-weight: 600;
          color: #374151;
        }

        .network-total {
          font-weight: 600;
          color: #111827;
        }

        .balance-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          border-left: 3px solid #e5e7eb;
          margin-left: 8px;
        }

        .balance-symbol {
          flex: 0 0 80px;
          font-weight: 600;
          color: #374151;
        }

        .balance-amount {
          flex: 1;
          text-align: right;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          color: #6b7280;
        }

        .balance-usd {
          flex: 0 0 120px;
          text-align: right;
          font-weight: 500;
          color: #111827;
        }

        .errors-section {
          margin-bottom: 16px;
        }

        .error-item {
          padding: 12px;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #dc2626;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .no-balance-section {
          margin-bottom: 16px;
        }

        .toggle-no-balance {
          width: 100%;
          padding: 10px 12px;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background-color 0.2s;
        }

        .toggle-no-balance:hover {
          background-color: #f3f4f6;
        }

        .toggle-icon {
          font-size: 12px;
        }

        .no-balance-list {
          margin-top: 8px;
          padding: 12px;
          background-color: #f9fafb;
          border-radius: 6px;
        }

        .no-balance-item {
          padding: 4px 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .zero-balance-state {
          padding: 20px;
          text-align: center;
          color: #9ca3af;
          font-size: 14px;
          background-color: #f9fafb;
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .card-actions {
          display: flex;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .btn-secondary {
          flex: 1;
          padding: 10px 20px;
          background-color: white;
          color: #3b82f6;
          border: 1px solid #3b82f6;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #3b82f6;
          color: white;
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-danger {
          flex: 1;
          padding: 10px 20px;
          background-color: white;
          color: #dc2626;
          border: 1px solid #dc2626;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-danger:hover:not(:disabled) {
          background-color: #dc2626;
          color: white;
        }

        .btn-danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
