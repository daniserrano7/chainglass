import type { Network } from "../types";
import { getCustomNetworks } from "../services/storage";

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
 * Get all networks (default + custom)
 */
export function getAllNetworks(): Network[] {
  const customNetworks = getCustomNetworks();
  const defaultNetworks = Object.values(EVM_NETWORKS);

  // Merge default and custom networks, avoiding duplicates by ID
  const networksMap = new Map<string, Network>();

  // Add default networks first
  defaultNetworks.forEach((network) => {
    networksMap.set(network.id, network);
  });

  // Add custom networks (will override defaults with same ID)
  customNetworks.forEach((network) => {
    networksMap.set(network.id, network);
  });

  return Array.from(networksMap.values());
}

/**
 * Get all enabled EVM networks (includes custom networks)
 */
export function getEnabledNetworks(): Network[] {
  return getAllNetworks();
}

/**
 * Get network by ID (checks both default and custom networks)
 */
export function getNetworkById(networkId: string): Network | undefined {
  const defaultNetwork = EVM_NETWORKS[networkId];
  if (defaultNetwork) return defaultNetwork;

  const customNetworks = getCustomNetworks();
  return customNetworks.find((n) => n.id === networkId);
}

/**
 * Get network by chain ID (checks both default and custom networks)
 */
export function getNetworkByChainId(chainId: number): Network | undefined {
  const allNetworks = getAllNetworks();
  return allNetworks.find((n) => n.chainId === chainId);
}

/**
 * Get networks grouped by chain family
 */
export function getNetworksByFamily(): Record<string, Network[]> {
  const allNetworks = getAllNetworks();
  const grouped: Record<string, Network[]> = {};

  allNetworks.forEach((network) => {
    if (!grouped[network.chainFamily]) {
      grouped[network.chainFamily] = [];
    }
    grouped[network.chainFamily].push(network);
  });

  return grouped;
}

/**
 * Validate if an address is a valid EVM address
 */
export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
