import { Network } from '../types';

// Ethereum Mainnet
export const ETHEREUM: Network = {
  networkId: 'ethereum',
  displayName: 'Ethereum',
  chainId: 1,
  rpcUrl: 'https://eth.llamarpc.com',
  nativeToken: {
    symbol: 'ETH',
    decimals: 18,
    coinGeckoId: 'ethereum',
    isNative: true,
  },
  blockExplorerUrl: 'https://etherscan.io',
  commonTokens: [
    {
      symbol: 'USDC',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      coinGeckoId: 'usd-coin',
      isStablecoin: true,
    },
    {
      symbol: 'USDT',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      coinGeckoId: 'tether',
      isStablecoin: true,
    },
    {
      symbol: 'DAI',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18,
      coinGeckoId: 'dai',
      isStablecoin: true,
    },
    {
      symbol: 'WETH',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18,
      coinGeckoId: 'ethereum', // Same as ETH
    },
    {
      symbol: 'LINK',
      address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      decimals: 18,
      coinGeckoId: 'chainlink',
    },
    {
      symbol: 'UNI',
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      decimals: 18,
      coinGeckoId: 'uniswap',
    },
  ],
};

// Polygon
export const POLYGON: Network = {
  networkId: 'polygon',
  displayName: 'Polygon',
  chainId: 137,
  rpcUrl: 'https://polygon.llamarpc.com',
  nativeToken: {
    symbol: 'MATIC',
    decimals: 18,
    coinGeckoId: 'matic-network',
    isNative: true,
  },
  blockExplorerUrl: 'https://polygonscan.com',
  commonTokens: [
    {
      symbol: 'USDC',
      address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      decimals: 6,
      coinGeckoId: 'usd-coin',
      isStablecoin: true,
    },
    {
      symbol: 'USDT',
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      decimals: 6,
      coinGeckoId: 'tether',
      isStablecoin: true,
    },
    {
      symbol: 'DAI',
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      decimals: 18,
      coinGeckoId: 'dai',
      isStablecoin: true,
    },
    {
      symbol: 'WMATIC',
      address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      decimals: 18,
      coinGeckoId: 'matic-network', // Same as MATIC
    },
  ],
};

// Arbitrum One
export const ARBITRUM: Network = {
  networkId: 'arbitrum',
  displayName: 'Arbitrum One',
  chainId: 42161,
  rpcUrl: 'https://arbitrum.llamarpc.com',
  nativeToken: {
    symbol: 'ETH',
    decimals: 18,
    coinGeckoId: 'ethereum',
    isNative: true,
  },
  blockExplorerUrl: 'https://arbiscan.io',
  commonTokens: [
    {
      symbol: 'USDC',
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      decimals: 6,
      coinGeckoId: 'usd-coin',
      isStablecoin: true,
    },
    {
      symbol: 'USDT',
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      decimals: 6,
      coinGeckoId: 'tether',
      isStablecoin: true,
    },
    {
      symbol: 'DAI',
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      decimals: 18,
      coinGeckoId: 'dai',
      isStablecoin: true,
    },
    {
      symbol: 'WETH',
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      decimals: 18,
      coinGeckoId: 'ethereum',
    },
  ],
};

// Optimism
export const OPTIMISM: Network = {
  networkId: 'optimism',
  displayName: 'Optimism',
  chainId: 10,
  rpcUrl: 'https://optimism.llamarpc.com',
  nativeToken: {
    symbol: 'ETH',
    decimals: 18,
    coinGeckoId: 'ethereum',
    isNative: true,
  },
  blockExplorerUrl: 'https://optimistic.etherscan.io',
  commonTokens: [
    {
      symbol: 'USDC',
      address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      decimals: 6,
      coinGeckoId: 'usd-coin',
      isStablecoin: true,
    },
    {
      symbol: 'USDT',
      address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      decimals: 6,
      coinGeckoId: 'tether',
      isStablecoin: true,
    },
    {
      symbol: 'DAI',
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      decimals: 18,
      coinGeckoId: 'dai',
      isStablecoin: true,
    },
    {
      symbol: 'WETH',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      coinGeckoId: 'ethereum',
    },
  ],
};

// Base
export const BASE: Network = {
  networkId: 'base',
  displayName: 'Base',
  chainId: 8453,
  rpcUrl: 'https://base.llamarpc.com',
  nativeToken: {
    symbol: 'ETH',
    decimals: 18,
    coinGeckoId: 'ethereum',
    isNative: true,
  },
  blockExplorerUrl: 'https://basescan.org',
  commonTokens: [
    {
      symbol: 'USDC',
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
      coinGeckoId: 'usd-coin',
      isStablecoin: true,
    },
    {
      symbol: 'DAI',
      address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      decimals: 18,
      coinGeckoId: 'dai',
      isStablecoin: true,
    },
  ],
};

// All networks
export const NETWORKS: Network[] = [
  ETHEREUM,
  POLYGON,
  ARBITRUM,
  OPTIMISM,
  BASE,
];

// Network lookup by ID
export const NETWORKS_BY_ID: Record<string, Network> = {
  ethereum: ETHEREUM,
  polygon: POLYGON,
  arbitrum: ARBITRUM,
  optimism: OPTIMISM,
  base: BASE,
};
