import { useState } from 'react';
import { NetworkBalance } from '../types';
import { formatUSD } from '../utils/formatting';
import TokenList from './TokenList';
import './NetworkSection.css';

interface NetworkSectionProps {
  networkBalance: NetworkBalance;
}

function NetworkSection({ networkBalance }: NetworkSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { network, nativeBalance, tokenBalances, totalUsdValue, isLoading, error } = networkBalance;

  return (
    <div className="network-section">
      <div
        className="network-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="network-info">
          <h3 className="network-name">{network.displayName}</h3>
          <div className="network-total">
            {isLoading ? (
              <span className="loading-text">Loading...</span>
            ) : error ? (
              <span className="error-text">Error loading balance</span>
            ) : (
              <span className="total-value">{formatUSD(totalUsdValue)}</span>
            )}
          </div>
        </div>
        <div className="expand-icon">
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>

      {isExpanded && !isLoading && !error && (
        <div className="network-content">
          <TokenList
            nativeBalance={nativeBalance}
            tokenBalances={tokenBalances}
          />
        </div>
      )}

      {isExpanded && error && (
        <div className="network-error">
          <p>Failed to load balances for {network.displayName}</p>
          <p className="error-details">{error}</p>
        </div>
      )}
    </div>
  );
}

export default NetworkSection;
