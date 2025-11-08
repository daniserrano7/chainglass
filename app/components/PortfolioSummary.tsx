import type { PortfolioSummary as PortfolioSummaryType } from "~/lib/types";
import { formatUsdValue } from "~/lib/services";

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType;
}

export function PortfolioSummary({ summary }: PortfolioSummaryProps) {
  return (
    <div className="portfolio-summary">
      <div className="summary-header">
        <h1>ChainGlass</h1>
        <p className="tagline">See through your crypto</p>
      </div>

      <div className="total-portfolio">
        <div className="total-label">Total Portfolio Value</div>
        <div className="total-value">{formatUsdValue(summary.totalUsdValue)}</div>
        <div className="total-addresses">
          Tracking {summary.totalAddresses} address{summary.totalAddresses !== 1 ? "es" : ""}
        </div>
      </div>

      {summary.networkBreakdown.length > 0 && (
        <div className="breakdown-section">
          <h3>Breakdown by Network</h3>
          <div className="breakdown-list">
            {summary.networkBreakdown.map((network) => (
              <div key={network.networkId} className="breakdown-item">
                <div className="breakdown-info">
                  <span className="breakdown-name">{network.networkName}</span>
                  <span className="breakdown-percentage">
                    {network.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="breakdown-bar-container">
                  <div
                    className="breakdown-bar"
                    style={{ width: `${network.percentage}%` }}
                  />
                </div>
                <div className="breakdown-value">
                  {formatUsdValue(network.totalUsdValue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.assetBreakdown && summary.assetBreakdown.length > 0 && (
        <div className="breakdown-section">
          <h3>Top Assets</h3>
          <div className="assets-list">
            {summary.assetBreakdown.slice(0, 10).map((asset) => (
              <div key={asset.symbol} className="asset-item">
                <div className="asset-info">
                  <span className="asset-symbol">{asset.symbol}</span>
                  <span className="asset-amount">{asset.totalAmount}</span>
                </div>
                <div className="asset-value-info">
                  <span className="asset-value">
                    {formatUsdValue(asset.totalUsdValue)}
                  </span>
                  <span className="asset-percentage">
                    {asset.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .portfolio-summary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 32px;
          color: white;
        }

        .summary-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .summary-header h1 {
          margin: 0 0 8px 0;
          font-size: 36px;
          font-weight: 700;
        }

        .tagline {
          margin: 0;
          font-size: 16px;
          opacity: 0.9;
        }

        .total-portfolio {
          text-align: center;
          padding: 32px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          margin-bottom: 32px;
        }

        .total-label {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.9;
          margin-bottom: 12px;
        }

        .total-value {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .total-addresses {
          font-size: 14px;
          opacity: 0.8;
        }

        .breakdown-section {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          backdrop-filter: blur(10px);
        }

        .breakdown-section:last-child {
          margin-bottom: 0;
        }

        .breakdown-section h3 {
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .breakdown-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .breakdown-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .breakdown-name {
          font-weight: 500;
        }

        .breakdown-percentage {
          font-size: 14px;
          opacity: 0.9;
        }

        .breakdown-bar-container {
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .breakdown-bar {
          height: 100%;
          background: white;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .breakdown-value {
          font-size: 20px;
          font-weight: 600;
        }

        .assets-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .asset-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .asset-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .asset-symbol {
          font-weight: 600;
          font-size: 16px;
        }

        .asset-amount {
          font-size: 12px;
          opacity: 0.8;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }

        .asset-value-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .asset-value {
          font-weight: 600;
          font-size: 16px;
        }

        .asset-percentage {
          font-size: 12px;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .portfolio-summary {
            padding: 24px;
          }

          .summary-header h1 {
            font-size: 28px;
          }

          .total-value {
            font-size: 36px;
          }
        }
      `}</style>
    </div>
  );
}
