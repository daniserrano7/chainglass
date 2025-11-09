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
        /* Mobile-first base styles */
        .address-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .card-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid #f3f4f6;
        }

        .address-info {
          flex: 1;
        }

        .address-label {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .address-value {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 4px;
          word-break: break-all;
        }

        .chain-badge {
          display: inline-block;
          padding: 2px 8px;
          background-color: #dbeafe;
          color: #1e40af;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          margin-left: 4px;
        }

        .last-scanned {
          font-size: 11px;
          color: #9ca3af;
        }

        .address-total {
          text-align: left;
          padding: 12px;
          background-color: #f9fafb;
          border-radius: 6px;
        }

        .total-label {
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .total-value {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
        }

        .networks-section {
          margin-bottom: 12px;
        }

        .network-group {
          margin-bottom: 12px;
        }

        .network-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 10px;
          background-color: #f9fafb;
          border-radius: 6px;
          margin-bottom: 6px;
          gap: 8px;
        }

        .network-name {
          font-weight: 600;
          color: #374151;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .network-total {
          font-weight: 600;
          color: #111827;
          font-size: 13px;
          white-space: nowrap;
        }

        .balance-row {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 8px;
          align-items: center;
          padding: 6px 8px;
          border-left: 3px solid #e5e7eb;
          margin-left: 4px;
          font-size: 13px;
        }

        .balance-symbol {
          font-weight: 600;
          color: #374151;
          white-space: nowrap;
        }

        .balance-amount {
          text-align: right;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 12px;
          color: #6b7280;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .balance-usd {
          text-align: right;
          font-weight: 500;
          color: #111827;
          white-space: nowrap;
          font-size: 13px;
        }

        .errors-section {
          margin-bottom: 12px;
        }

        .error-item {
          padding: 10px;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #dc2626;
          font-size: 12px;
          margin-bottom: 6px;
          word-break: break-word;
        }

        .no-balance-section {
          margin-bottom: 12px;
        }

        .toggle-no-balance {
          width: 100%;
          padding: 10px 12px;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 13px;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background-color 0.2s;
          min-height: 44px;
        }

        .toggle-no-balance:hover {
          background-color: #f3f4f6;
        }

        .toggle-icon {
          font-size: 12px;
          margin-left: 8px;
        }

        .no-balance-list {
          margin-top: 6px;
          padding: 10px;
          background-color: #f9fafb;
          border-radius: 6px;
        }

        .no-balance-item {
          padding: 4px 6px;
          font-size: 13px;
          color: #6b7280;
        }

        .zero-balance-state {
          padding: 16px;
          text-align: center;
          color: #9ca3af;
          font-size: 13px;
          background-color: #f9fafb;
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .card-actions {
          display: flex;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid #f3f4f6;
        }

        .btn-secondary {
          flex: 1;
          padding: 12px 16px;
          background-color: white;
          color: #3b82f6;
          border: 1px solid #3b82f6;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 44px;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #3b82f6;
          color: white;
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary:active:not(:disabled) {
          transform: scale(0.98);
        }

        .btn-danger {
          flex: 1;
          padding: 12px 16px;
          background-color: white;
          color: #dc2626;
          border: 1px solid #dc2626;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 44px;
        }

        .btn-danger:hover:not(:disabled) {
          background-color: #dc2626;
          color: white;
        }

        .btn-danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-danger:active:not(:disabled) {
          transform: scale(0.98);
        }

        /* Tablet styles (640px+) */
        @media (min-width: 640px) {
          .address-card {
            padding: 20px;
            margin-bottom: 16px;
          }

          .card-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 16px;
          }

          .address-label {
            font-size: 18px;
          }

          .address-value {
            font-size: 14px;
            word-break: normal;
          }

          .chain-badge {
            font-size: 12px;
            margin-left: 8px;
          }

          .last-scanned {
            font-size: 12px;
          }

          .address-total {
            text-align: right;
            padding: 0;
            background-color: transparent;
          }

          .total-label {
            font-size: 12px;
          }

          .total-value {
            font-size: 24px;
          }

          .network-header {
            padding: 8px 12px;
            margin-bottom: 8px;
          }

          .network-name {
            font-size: 14px;
          }

          .network-total {
            font-size: 14px;
          }

          .balance-row {
            grid-template-columns: 80px 1fr 120px;
            padding: 8px 16px;
            margin-left: 8px;
            font-size: 14px;
          }

          .balance-symbol {
            font-size: 14px;
          }

          .balance-amount {
            font-size: 14px;
          }

          .balance-usd {
            font-size: 14px;
          }

          .error-item {
            padding: 12px;
            font-size: 14px;
            margin-bottom: 8px;
          }

          .toggle-no-balance {
            font-size: 14px;
          }

          .no-balance-item {
            font-size: 14px;
          }

          .zero-balance-state {
            padding: 20px;
            font-size: 14px;
          }

          .card-actions {
            gap: 12px;
            padding-top: 16px;
          }

          .btn-secondary,
          .btn-danger {
            padding: 10px 20px;
          }

          .networks-section {
            margin-bottom: 16px;
          }

          .network-group {
            margin-bottom: 16px;
          }
        }
      `}</style>
    </div>
  );
}
