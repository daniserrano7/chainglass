/**
 * Server-side balance caching service
 * Balances are cached per-user with dynamic TTL:
 * - Non-zero balance chains: 10 minutes
 * - Zero balance chains: 1 hour
 */

import { UserCacheManager, CacheEntry } from "./cache-manager.server";
import { getNetworkById, getEnabledNetworks } from "../config/networks";
import { getTokensForNetwork } from "../config/tokens";
import {
  fetchNativeBalance,
  fetchTokenBalances,
} from "../services/rpc";
import { getTokenPrices, calculateUsdValue } from "./prices.server";
import type { NetworkBalance, Balance } from "../types/portfolio";

// Cache TTLs
const NON_ZERO_BALANCE_TTL = 10 * 60 * 1000; // 10 minutes
const ZERO_BALANCE_TTL = 60 * 60 * 1000; // 1 hour

// Global balance cache instance (per-user)
const balanceCache = new UserCacheManager<NetworkBalance>(NON_ZERO_BALANCE_TTL);

// Track which chains had non-zero balances per user
const balanceStateCache = new UserCacheManager<boolean>(NON_ZERO_BALANCE_TTL);

export interface ScanOptions {
  forceRefresh?: boolean;
  networksToScan?: string[]; // If provided, only scan these networks
}

export interface BalanceScanResult {
  balances: NetworkBalance[];
  totalUsdValue: number;
  cached: string[];
  fetched: string[];
  errors: string[];
  refreshStrategy: {
    networkId: string;
    hadBalance: boolean;
    ttl: number;
  }[];
}

/**
 * Determine TTL based on whether the chain has a non-zero balance
 */
function determineTTL(hasBalance: boolean): number {
  return hasBalance ? NON_ZERO_BALANCE_TTL : ZERO_BALANCE_TTL;
}

/**
 * Check if a network balance is non-zero
 */
function hasNonZeroBalance(networkBalance: NetworkBalance): boolean {
  return networkBalance.totalUsdValue > 0 || networkBalance.hasBalance;
}

/**
 * Scan a single network for balances
 */
async function scanNetwork(
  address: string,
  networkId: string
): Promise<NetworkBalance> {
  const network = getNetworkById(networkId);
  if (!network) {
    throw new Error(`Network ${networkId} not found`);
  }

  const networkBalance: NetworkBalance = {
    networkId: network.id,
    networkName: network.name,
    tokenBalances: [],
    totalUsdValue: 0,
    hasBalance: false,
    lastFetched: Date.now(),
  };

  try {
    // Fetch native balance
    const nativeBalance = await fetchNativeBalance(address, networkId);

    // Fetch token balances
    const tokens = getTokensForNetwork(networkId);
    const tokenBalances = await fetchTokenBalances(
      address,
      networkId,
      tokens.map((t) => t.contractAddress)
    );

    // Combine all balances
    const allBalances: Balance[] = [];
    if (nativeBalance) {
      allBalances.push(nativeBalance);
    }
    allBalances.push(...tokenBalances);

    // Get prices for all tokens
    const priceRequests = allBalances.map((b) => ({
      coingeckoId: b.isNative
        ? network.nativeToken.coingeckoId
        : tokens.find((t) => t.contractAddress === b.contractAddress)
            ?.coingeckoId || "",
      symbol: b.symbol,
    }));

    const priceResult = await getTokenPrices(priceRequests);

    // Calculate USD values
    let totalUsdValue = 0;
    const balancesWithUsd: Balance[] = [];

    for (const balance of allBalances) {
      const coingeckoId = balance.isNative
        ? network.nativeToken.coingeckoId
        : tokens.find((t) => t.contractAddress === balance.contractAddress)
            ?.coingeckoId || "";

      const price = priceResult.prices.get(coingeckoId);
      const usdValue = calculateUsdValue(
        balance.amount,
        balance.decimals,
        price ?? null
      );

      balancesWithUsd.push({
        ...balance,
        usdValue,
      });

      if (usdValue) {
        totalUsdValue += usdValue;
      }
    }

    // Update network balance
    if (nativeBalance) {
      const nativeBalanceWithUsd = balancesWithUsd.find((b) => b.isNative);
      networkBalance.nativeBalance = nativeBalanceWithUsd;
    }

    networkBalance.tokenBalances = balancesWithUsd.filter((b) => !b.isNative);
    networkBalance.totalUsdValue = totalUsdValue;
    networkBalance.hasBalance = allBalances.some(
      (b) => parseFloat(b.formattedAmount) > 0
    );
  } catch (error) {
    networkBalance.error =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Error scanning network ${networkId}:`, error);
  }

  return networkBalance;
}

/**
 * Get cached balances for an address
 * Returns null if no cache exists or if it's time to refresh based on strategy
 */
function getCachedBalance(
  address: string,
  networkId: string
): NetworkBalance | null {
  const cacheKey = networkId;
  const entry = balanceCache.getEntry(address, cacheKey);

  if (!entry) {
    return null;
  }

  // Check if we should refresh based on the balance state
  const hadBalance = balanceStateCache.get(address, cacheKey) ?? false;
  const now = Date.now();
  const age = now - entry.timestamp;
  const expectedTTL = determineTTL(hadBalance);

  // If age exceeds expected TTL, return null to trigger refresh
  if (age > expectedTTL) {
    return null;
  }

  return entry.data;
}

/**
 * Set balance cache with appropriate TTL
 */
function setCachedBalance(
  address: string,
  networkId: string,
  balance: NetworkBalance
): void {
  const cacheKey = networkId;
  const hasBalance = hasNonZeroBalance(balance);
  const ttl = determineTTL(hasBalance);

  // Store balance with dynamic TTL
  balanceCache.set(address, cacheKey, balance, ttl);

  // Store balance state for future TTL decisions
  balanceStateCache.set(address, cacheKey, hasBalance, ttl);
}

/**
 * Scan address across all or specified networks
 */
export async function scanAddress(
  address: string,
  options: ScanOptions = {}
): Promise<BalanceScanResult> {
  const { forceRefresh = false, networksToScan } = options;

  const result: BalanceScanResult = {
    balances: [],
    totalUsdValue: 0,
    cached: [],
    fetched: [],
    errors: [],
    refreshStrategy: [],
  };

  // Determine which networks to scan
  let networks = getEnabledNetworks();
  if (networksToScan && networksToScan.length > 0) {
    networks = networks.filter((n) => networksToScan.includes(n.id));
  }

  // Check if we have any cached data
  const hasCachedData = networks.some(
    (network) => balanceCache.get(address, network.id) !== null
  );

  // If no cached data, fetch from all chains
  if (!hasCachedData || forceRefresh) {
    // Fetch from all chains
    for (const network of networks) {
      try {
        const networkBalance = await scanNetwork(address, network.id);
        result.balances.push(networkBalance);
        result.totalUsdValue += networkBalance.totalUsdValue;
        result.fetched.push(network.id);

        // Cache the result
        setCachedBalance(address, network.id, networkBalance);

        // Track refresh strategy
        const hasBalance = hasNonZeroBalance(networkBalance);
        result.refreshStrategy.push({
          networkId: network.id,
          hadBalance: hasBalance,
          ttl: determineTTL(hasBalance),
        });
      } catch (error) {
        result.errors.push(network.id);
        console.error(`Error scanning network ${network.id}:`, error);
      }
    }
  } else {
    // Use cached data with smart refresh
    for (const network of networks) {
      const cached = getCachedBalance(address, network.id);

      if (cached) {
        // Use cached data
        result.balances.push(cached);
        result.totalUsdValue += cached.totalUsdValue;
        result.cached.push(network.id);

        const hadBalance = balanceStateCache.get(address, network.id) ?? false;
        result.refreshStrategy.push({
          networkId: network.id,
          hadBalance,
          ttl: determineTTL(hadBalance),
        });
      } else {
        // Cache expired or doesn't exist, fetch fresh data
        try {
          const networkBalance = await scanNetwork(address, network.id);
          result.balances.push(networkBalance);
          result.totalUsdValue += networkBalance.totalUsdValue;
          result.fetched.push(network.id);

          // Cache the result
          setCachedBalance(address, network.id, networkBalance);

          const hasBalance = hasNonZeroBalance(networkBalance);
          result.refreshStrategy.push({
            networkId: network.id,
            hadBalance: hasBalance,
            ttl: determineTTL(hasBalance),
          });
        } catch (error) {
          result.errors.push(network.id);
          console.error(`Error scanning network ${network.id}:`, error);
        }
      }
    }
  }

  return result;
}

/**
 * Get balance cache statistics for a user
 */
export function getBalanceCacheStats(address: string) {
  return balanceCache.getUserStats(address);
}

/**
 * Clear balance cache for a specific user
 */
export function clearUserBalanceCache(address: string): void {
  balanceCache.clearUser(address);
  balanceStateCache.clearUser(address);
}

/**
 * Clear all balance caches
 */
export function clearAllBalanceCaches(): void {
  balanceCache.clearAll();
  balanceStateCache.clearAll();
}

/**
 * Background refresh for chains that need updating
 * Call this periodically to keep active addresses fresh
 */
export async function backgroundBalanceRefresh(
  addresses: string[]
): Promise<void> {
  const now = Date.now();

  for (const address of addresses) {
    const networks = getEnabledNetworks();

    for (const network of networks) {
      const entry = balanceCache.getEntry(address, network.id);
      if (!entry) continue;

      const hadBalance = balanceStateCache.get(address, network.id) ?? false;
      const expectedTTL = determineTTL(hadBalance);
      const age = now - entry.timestamp;

      // Refresh if within 2 minutes of expiry
      const timeUntilExpiry = expectedTTL - age;
      if (timeUntilExpiry < 2 * 60 * 1000 && timeUntilExpiry > 0) {
        console.log(
          `Background refresh: ${address} on ${network.id} (${
            hadBalance ? "non-zero" : "zero"
          } balance)`
        );
        try {
          const networkBalance = await scanNetwork(address, network.id);
          setCachedBalance(address, network.id, networkBalance);
        } catch (error) {
          console.error(
            `Background refresh error for ${network.id}:`,
            error
          );
        }
      }
    }
  }
}

/**
 * Get cache info for debugging
 */
export function getAllCacheStats() {
  return {
    balances: balanceCache.getStats(),
    balanceStates: balanceStateCache.getStats(),
  };
}
