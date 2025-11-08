import type { Network } from "../types";

/**
 * EVM Network configurations
 * These are the default networks scanned for all EVM addresses
 */
export const EVM_NETWORKS: Record<string, Network> = {
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    chainId: 1,
    rpcUrl: "https://eth.llamarpc.com",
    nativeToken: {
      symbol: "ETH",
      decimals: 18,
      coingeckoId: "ethereum",
    },
    blockExplorerUrl: "https://etherscan.io",
    multicallAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
    chainFamily: "evm",
  },

  polygon: {
    id: "polygon",
    name: "Polygon",
    chainId: 137,
    rpcUrl: "https://polygon.llamarpc.com",
    nativeToken: {
      symbol: "MATIC",
      decimals: 18,
      coingeckoId: "matic-network",
    },
    blockExplorerUrl: "https://polygonscan.com",
    multicallAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
    chainFamily: "evm",
  },

  arbitrum: {
    id: "arbitrum",
    name: "Arbitrum One",
    chainId: 42161,
    rpcUrl: "https://arbitrum.llamarpc.com",
    nativeToken: {
      symbol: "ETH",
      decimals: 18,
      coingeckoId: "ethereum",
    },
    blockExplorerUrl: "https://arbiscan.io",
    multicallAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
    chainFamily: "evm",
  },

  optimism: {
    id: "optimism",
    name: "Optimism",
    chainId: 10,
    rpcUrl: "https://optimism.llamarpc.com",
    nativeToken: {
      symbol: "ETH",
      decimals: 18,
      coingeckoId: "ethereum",
    },
    blockExplorerUrl: "https://optimistic.etherscan.io",
    multicallAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
    chainFamily: "evm",
  },

  base: {
    id: "base",
    name: "Base",
    chainId: 8453,
    rpcUrl: "https://base.llamarpc.com",
    nativeToken: {
      symbol: "ETH",
      decimals: 18,
      coingeckoId: "ethereum",
    },
    blockExplorerUrl: "https://basescan.org",
    multicallAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
    chainFamily: "evm",
  },
};

/**
 * Get all enabled EVM networks
 */
export function getEnabledNetworks(): Network[] {
  return Object.values(EVM_NETWORKS);
}

/**
 * Get network by ID
 */
export function getNetworkById(networkId: string): Network | undefined {
  return EVM_NETWORKS[networkId];
}

/**
 * Get network by chain ID
 */
export function getNetworkByChainId(chainId: number): Network | undefined {
  return Object.values(EVM_NETWORKS).find((n) => n.chainId === chainId);
}

/**
 * Validate if an address is a valid EVM address
 */
export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
