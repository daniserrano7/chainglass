interface ScanProgressProps {
  networks: Array<{
    networkId: string;
    networkName: string;
    status: "pending" | "scanning" | "completed" | "error";
    error?: string;
  }>;
}

export function ScanProgress({ networks }: ScanProgressProps) {
  const completed = networks.filter((n) => n.status === "completed").length;
  const total = networks.length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="scan-progress">
      <div className="progress-header">
        <span className="progress-title">🔍 Scanning address...</span>
        <span className="progress-count">
          {completed} / {total} networks
        </span>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${percentage}%` }} />
      </div>

      <div className="networks-status">
        {networks.map((network) => (
          <div key={network.networkId} className={`network-status status-${network.status}`}>
            <span className="status-icon">
              {network.status === "completed" && "✓"}
              {network.status === "scanning" && "⟳"}
              {network.status === "pending" && "⋯"}
              {network.status === "error" && "⚠️"}
            </span>
            <span className="network-name">{network.networkName}</span>
            {network.status === "error" && network.error && (
              <span className="error-text">({network.error})</span>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .scan-progress {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .progress-title {
          font-weight: 600;
          color: #111827;
        }

        .progress-count {
          font-size: 14px;
          color: #6b7280;
        }

        .progress-bar-container {
          height: 8px;
          background-color: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .networks-status {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 8px;
        }

        .network-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
        }

        .status-pending {
          background-color: #f3f4f6;
          color: #6b7280;
        }

        .status-scanning {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .status-completed {
          background-color: #d1fae5;
          color: #065f46;
        }

        .status-error {
          background-color: #fef2f2;
          color: #dc2626;
        }

        .status-icon {
          font-size: 16px;
        }

        .status-scanning .status-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .network-name {
          font-weight: 500;
        }

        .error-text {
          font-size: 12px;
          opacity: 0.8;
          margin-left: auto;
        }
      `}</style>
    </div>
  );
}
