import type { PortfolioSummary as PortfolioSummaryType } from "~/lib/types";
import { formatUsdValue } from "~/lib/services";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType;
}

// Color palette for charts
const CHART_COLORS = [
  "#a78bfa", // Purple 400
  "#c084fc", // Purple 300
  "#e9d5ff", // Purple 200
  "#8b5cf6", // Purple 500
  "#7c3aed", // Purple 600
  "#6d28d9", // Purple 700
  "#f3e8ff", // Purple 100
  "#ddd6fe", // Purple 200 variant
];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(0, 0, 0, 0.9)",
          padding: "12px 16px",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <p style={{ margin: 0, color: "#fff", fontWeight: 600, fontSize: "14px" }}>
          {payload[0].name}
        </p>
        <p style={{ margin: "4px 0 0 0", color: "#a78bfa", fontSize: "13px" }}>
          {formatUsdValue(payload[0].value)}
        </p>
        {payload[0].payload.percentage !== undefined && (
          <p style={{ margin: "2px 0 0 0", color: "#c4b5fd", fontSize: "12px" }}>
            {payload[0].payload.percentage.toFixed(1)}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function PortfolioSummary({ summary }: PortfolioSummaryProps) {
  // Prepare chart data
  const networkChartData = summary.networkBreakdown.map((network) => ({
    name: network.networkName,
    value: network.totalUsdValue,
    percentage: network.percentage,
  }));

  const assetChartData = summary.assetBreakdown
    ? summary.assetBreakdown.slice(0, 10).map((asset) => ({
        name: asset.symbol,
        value: asset.totalUsdValue,
        percentage: asset.percentage,
      }))
    : [];

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
          <div className="chart-grid">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={networkChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {networkChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="breakdown-list">
              {summary.networkBreakdown.map((network, index) => (
                <div key={network.networkId} className="breakdown-item">
                  <div className="breakdown-info">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        className="legend-dot"
                        style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="breakdown-name">{network.networkName}</span>
                    </div>
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
        </div>
      )}

      {summary.assetBreakdown && summary.assetBreakdown.length > 0 && (
        <div className="breakdown-section">
          <h3>Top Assets</h3>
          <div className="chart-grid">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={assetChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis
                    type="number"
                    stroke="#fff"
                    tick={{ fill: "#fff", fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#fff"
                    tick={{ fill: "#fff", fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {assetChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="assets-list">
              {summary.assetBreakdown.slice(0, 10).map((asset, index) => (
                <div key={asset.symbol} className="asset-item">
                  <div className="asset-info">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        className="legend-dot"
                        style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <div>
                        <div className="asset-symbol">{asset.symbol}</div>
                        <div className="asset-amount">{asset.totalAmount}</div>
                      </div>
                    </div>
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
        </div>
      )}

      <style>{`
        /* Mobile-first base styles */
        .portfolio-summary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          color: white;
        }

        .summary-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .summary-header h1 {
          margin: 0 0 8px 0;
          font-size: clamp(24px, 6vw, 36px);
          font-weight: 700;
        }

        .tagline {
          margin: 0;
          font-size: clamp(14px, 3.5vw, 16px);
          opacity: 0.9;
        }

        .total-portfolio {
          text-align: center;
          padding: 20px 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          backdrop-filter: blur(10px);
          margin-bottom: 20px;
        }

        .total-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.9;
          margin-bottom: 8px;
        }

        .total-value {
          font-size: clamp(32px, 8vw, 48px);
          font-weight: 700;
          margin-bottom: 8px;
          word-break: break-word;
        }

        .total-addresses {
          font-size: 13px;
          opacity: 0.8;
        }

        .breakdown-section {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          backdrop-filter: blur(10px);
        }

        .breakdown-section:last-child {
          margin-bottom: 0;
        }

        .breakdown-section h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .chart-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          align-items: start;
        }

        .chart-container {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 12px;
          min-height: 250px;
        }

        .breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .breakdown-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .breakdown-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .breakdown-name {
          font-weight: 500;
          font-size: 14px;
        }

        .breakdown-percentage {
          font-size: 13px;
          opacity: 0.9;
          white-space: nowrap;
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
          font-size: 18px;
          font-weight: 600;
        }

        .assets-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .asset-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          gap: 8px;
        }

        .asset-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
          flex: 1;
        }

        .asset-symbol {
          font-weight: 600;
          font-size: 15px;
        }

        .asset-amount {
          font-size: 11px;
          opacity: 0.8;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .asset-value-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          white-space: nowrap;
        }

        .asset-value {
          font-weight: 600;
          font-size: 15px;
        }

        .asset-percentage {
          font-size: 11px;
          opacity: 0.8;
        }

        /* Tablet styles (640px+) */
        @media (min-width: 640px) {
          .portfolio-summary {
            padding: 24px;
            border-radius: 12px;
            margin-bottom: 24px;
          }

          .summary-header {
            margin-bottom: 28px;
          }

          .total-portfolio {
            padding: 28px 24px;
            border-radius: 12px;
            margin-bottom: 28px;
          }

          .total-label {
            font-size: 13px;
            letter-spacing: 1px;
            margin-bottom: 10px;
          }

          .breakdown-section {
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 12px;
          }

          .breakdown-section h3 {
            margin-bottom: 18px;
            font-size: 17px;
          }

          .chart-grid {
            gap: 20px;
          }

          .chart-container {
            padding: 16px;
            min-height: 280px;
          }

          .breakdown-name {
            font-size: 15px;
          }

          .breakdown-percentage {
            font-size: 14px;
          }

          .breakdown-value {
            font-size: 19px;
          }

          .asset-item {
            padding: 12px;
            border-radius: 8px;
          }

          .asset-symbol {
            font-size: 16px;
          }

          .asset-amount {
            font-size: 12px;
          }

          .asset-value {
            font-size: 16px;
          }

          .asset-percentage {
            font-size: 12px;
          }

          .breakdown-list {
            gap: 14px;
          }

          .assets-list {
            gap: 12px;
          }
        }

        /* Desktop styles (1024px+) */
        @media (min-width: 1024px) {
          .portfolio-summary {
            padding: 32px;
            margin-bottom: 32px;
          }

          .summary-header {
            margin-bottom: 32px;
          }

          .total-portfolio {
            padding: 32px;
            margin-bottom: 32px;
          }

          .total-label {
            font-size: 14px;
            margin-bottom: 12px;
          }

          .breakdown-section {
            padding: 24px;
            margin-bottom: 24px;
          }

          .breakdown-section h3 {
            margin-bottom: 20px;
            font-size: 18px;
          }

          .chart-grid {
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }

          .chart-container {
            padding: 20px;
            min-height: 300px;
          }

          .breakdown-list {
            gap: 16px;
          }

          .breakdown-value {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}
