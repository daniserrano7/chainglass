import { TokenBalance } from '../types';
import { formatTokenBalance, formatUSD } from '../utils/formatting';
import './TokenItem.css';

interface TokenItemProps {
  tokenBalance: TokenBalance;
  isNative?: boolean;
}

function TokenItem({ tokenBalance, isNative = false }: TokenItemProps) {
  const { token, balanceFormatted, usdValue, usdPrice } = tokenBalance;

  return (
    <div className={`token-item ${isNative ? 'native' : ''}`}>
      <div className="token-info">
        <div className="token-symbol">
          {token.symbol}
          {isNative && <span className="native-badge">Native</span>}
          {token.isStablecoin && <span className="stablecoin-badge">Stable</span>}
        </div>
        <div className="token-price">
          {usdPrice !== null ? formatUSD(usdPrice) : '-'}
        </div>
      </div>
      <div className="token-amounts">
        <div className="token-balance">
          {formatTokenBalance(balanceFormatted)}
        </div>
        <div className="token-usd-value">
          {usdValue !== null ? formatUSD(usdValue) : '-'}
        </div>
      </div>
    </div>
  );
}

export default TokenItem;
