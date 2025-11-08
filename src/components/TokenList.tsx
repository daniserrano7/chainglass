import { TokenBalance } from '../types';
import TokenItem from './TokenItem';
import './TokenList.css';

interface TokenListProps {
  nativeBalance: TokenBalance;
  tokenBalances: TokenBalance[];
}

function TokenList({ nativeBalance, tokenBalances }: TokenListProps) {
  return (
    <div className="token-list">
      <TokenItem tokenBalance={nativeBalance} isNative />

      {tokenBalances.length > 0 && (
        <>
          <div className="token-list-divider">
            <span>ERC-20 Tokens</span>
          </div>
          {tokenBalances.map((balance) => (
            <TokenItem
              key={balance.token.address || balance.token.symbol}
              tokenBalance={balance}
            />
          ))}
        </>
      )}

      {tokenBalances.length === 0 && (
        <div className="no-tokens-message">
          No ERC-20 tokens found
        </div>
      )}
    </div>
  );
}

export default TokenList;
