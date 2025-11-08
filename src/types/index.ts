// Token information
export interface Token {
  symbol: string;
  address?: string; // Optional for native tokens
  decimals: number;
  coinGeckoId?: string;
  isNative?: boolean;
  isStablecoin?: boolean;
}

// Token balance with USD value
export interface TokenBalance {
  token: Token;
  balance: string; // Raw balance as string to avoid precision loss
  balanceFormatted: string; // Human-readable balance
  usdValue: number | null; // USD value, null if price unavailable
  usdPrice: number | null; // Price per token in USD
}

// Network configuration
export interface Network {
  networkId: string;
  displayName: string;
  chainId: number;
  rpcUrl: string;
  nativeToken: Token;
  blockExplorerUrl: string;
  multicallAddress?: string;
  commonTokens: Token[];
}

// Watched address
export interface WatchedAddress {
  id: string;
  address: string;
  chainFamily: 'evm';
  label: string;
  addedAt: number;
  lastScanned?: number;
  networksScanned?: string[];
}

// Network balance for an address
export interface NetworkBalance {
  network: Network;
  nativeBalance: TokenBalance;
  tokenBalances: TokenBalance[];
  totalUsdValue: number;
  isLoading: boolean;
  error?: string;
}

// Complete address data with all balances
export interface AddressData {
  address: WatchedAddress;
  networkBalances: NetworkBalance[];
  totalUsdValue: number;
}

// Price cache entry
export interface PriceCache {
  [coinGeckoId: string]: {
    price: number;
    timestamp: number;
  };
}

// Storage schema
export interface StorageData {
  watchedAddresses: WatchedAddress[];
  enabledNetworks: {
    evm: string[];
  };
  customTokens: {
    [networkId: string]: Token[];
  };
}
