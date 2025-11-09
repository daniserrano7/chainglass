import type { Token } from "../types";
import { getCustomTokensForNetwork } from "../services/storage";

/**
 * Common ERC-20 tokens per network
 * These tokens are automatically scanned for all watched addresses
 */

/**
 * Ethereum Mainnet tokens
 */
export const ETHEREUM_TOKENS: Token[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    coingeckoId: "usd-coin",
    isCustom: false,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
    coingeckoId: "tether",
    isCustom: false,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    decimals: 18,
    coingeckoId: "dai",
    isCustom: false,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    decimals: 18,
    coingeckoId: "weth",
    isCustom: false,
  },
  {
    symbol: "LINK",
    name: "ChainLink Token",
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    decimals: 18,
    coingeckoId: "chainlink",
    isCustom: false,
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    decimals: 18,
    coingeckoId: "uniswap",
    isCustom: false,
  },
];

/**
 * Polygon tokens
 */
export const POLYGON_TOKENS: Token[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    decimals: 6,
    coingeckoId: "usd-coin",
    isCustom: false,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    decimals: 6,
    coingeckoId: "tether",
    isCustom: false,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    decimals: 18,
    coingeckoId: "dai",
    isCustom: false,
  },
  {
    symbol: "WMATIC",
    name: "Wrapped Matic",
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    decimals: 18,
    coingeckoId: "wmatic",
    isCustom: false,
  },
];

/**
 * Arbitrum One tokens
 */
export const ARBITRUM_TOKENS: Token[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    decimals: 6,
    coingeckoId: "usd-coin",
    isCustom: false,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    decimals: 6,
    coingeckoId: "tether",
    isCustom: false,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    decimals: 18,
    coingeckoId: "dai",
    isCustom: false,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    decimals: 18,
    coingeckoId: "weth",
    isCustom: false,
  },
];

/**
 * Optimism tokens
 */
export const OPTIMISM_TOKENS: Token[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    decimals: 6,
    coingeckoId: "usd-coin",
    isCustom: false,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    decimals: 6,
    coingeckoId: "tether",
    isCustom: false,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    decimals: 18,
    coingeckoId: "dai",
    isCustom: false,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0x4200000000000000000000000000000000000006",
    decimals: 18,
    coingeckoId: "weth",
    isCustom: false,
  },
];

/**
 * Base tokens
 */
export const BASE_TOKENS: Token[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
    coingeckoId: "usd-coin",
    isCustom: false,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    decimals: 18,
    coingeckoId: "dai",
    isCustom: false,
  },
];

/**
 * Token configuration map - network ID to token list
 */
export const NETWORK_TOKENS: Record<string, Token[]> = {
  ethereum: ETHEREUM_TOKENS,
  polygon: POLYGON_TOKENS,
  arbitrum: ARBITRUM_TOKENS,
  optimism: OPTIMISM_TOKENS,
  base: BASE_TOKENS,
};

/**
 * Get tokens for a specific network (includes custom tokens)
 */
export function getTokensForNetwork(networkId: string): Token[] {
  const defaultTokens = NETWORK_TOKENS[networkId] || [];
  const customTokens = getCustomTokensForNetwork(networkId);

  // Merge default and custom tokens, avoiding duplicates by address
  const tokensMap = new Map<string, Token>();

  // Add default tokens first
  defaultTokens.forEach((token) => {
    tokensMap.set(token.address.toLowerCase(), token);
  });

  // Add custom tokens (will override defaults with same address)
  customTokens.forEach((token) => {
    tokensMap.set(token.address.toLowerCase(), token);
  });

  return Array.from(tokensMap.values());
}

/**
 * Get all tokens for a network (both default and custom)
 */
export function getAllTokensForNetwork(networkId: string): {
  default: Token[];
  custom: Token[];
  all: Token[];
} {
  const defaultTokens = NETWORK_TOKENS[networkId] || [];
  const customTokens = getCustomTokensForNetwork(networkId);

  return {
    default: defaultTokens,
    custom: customTokens,
    all: getTokensForNetwork(networkId),
  };
}

/**
 * Get all unique tokens across all networks
 */
export function getAllTokens(): Token[] {
  const allTokens = Object.values(NETWORK_TOKENS).flat();

  // Deduplicate by symbol (for analytics purposes)
  const uniqueTokens = new Map<string, Token>();
  for (const token of allTokens) {
    if (!uniqueTokens.has(token.symbol)) {
      uniqueTokens.set(token.symbol, token);
    }
  }

  return Array.from(uniqueTokens.values());
}

/**
 * Stablecoin addresses - these are assumed to be $1.00
 */
export const STABLECOIN_SYMBOLS = ["USDC", "USDT", "DAI"];

/**
 * Check if a token is a stablecoin (should be priced at $1.00)
 */
export function isStablecoin(symbol: string): boolean {
  return STABLECOIN_SYMBOLS.includes(symbol.toUpperCase());
}

/**
 * Wrapped token to native token mapping
 * These wrapped tokens should use the price of their native equivalent
 */
export const WRAPPED_TOKEN_MAPPING: Record<string, string> = {
  WETH: "ethereum",
  WMATIC: "matic-network",
  WBNB: "binancecoin",
  WAVAX: "avalanche-2",
  WFTM: "fantom",
};

/**
 * Get the CoinGecko ID for a wrapped token
 */
export function getWrappedTokenCoingeckoId(symbol: string): string | undefined {
  return WRAPPED_TOKEN_MAPPING[symbol.toUpperCase()];
}
