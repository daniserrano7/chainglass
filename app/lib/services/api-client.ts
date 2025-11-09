/**
 * Client-side API service for fetching cached data from the server
 */

import type { NetworkBalance } from "../types/portfolio";

export interface PriceApiResponse {
  prices: Record<string, number>;
  cached: string[];
  fetched: string[];
  errors: string[];
  cacheStats?: any;
}

export interface BalanceApiResponse {
  address: string;
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
  cacheStats?: any;
}

export interface CacheStatsResponse {
  prices: any;
  balances: any;
  timestamp: number;
}

/**
 * Fetch token prices from server cache
 */
export async function fetchPricesFromServer(
  tokens: Array<{ symbol: string; coingeckoId: string }>,
  includeStats = false
): Promise<PriceApiResponse> {
  const tokensParam = tokens
    .map((t) => `${t.symbol}:${t.coingeckoId}`)
    .join(",");

  const url = `/api/prices?tokens=${encodeURIComponent(tokensParam)}${
    includeStats ? "&includeStats=true" : ""
  }`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch prices: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch address balances from server cache
 */
export async function fetchBalancesFromServer(
  address: string,
  options: {
    networks?: string[];
    forceRefresh?: boolean;
    includeStats?: boolean;
  } = {}
): Promise<BalanceApiResponse> {
  const params = new URLSearchParams();

  if (options.networks && options.networks.length > 0) {
    params.set("networks", options.networks.join(","));
  }

  if (options.forceRefresh) {
    params.set("forceRefresh", "true");
  }

  if (options.includeStats) {
    params.set("includeStats", "true");
  }

  const url = `/api/balances/${address}${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch balances: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch cache statistics from server
 */
export async function fetchCacheStats(): Promise<CacheStatsResponse> {
  const response = await fetch("/api/cache-stats");

  if (!response.ok) {
    throw new Error(`Failed to fetch cache stats: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Clear price cache on server
 */
export async function clearPriceCache(): Promise<void> {
  const response = await fetch("/api/cache-stats?action=clear&type=prices", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to clear price cache: ${response.statusText}`);
  }
}

/**
 * Clear balance cache on server for a specific address or all addresses
 */
export async function clearBalanceCache(address?: string): Promise<void> {
  const url = address
    ? `/api/cache-stats?action=clear&type=balances&address=${address}`
    : "/api/cache-stats?action=clear&type=balances";

  const response = await fetch(url, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to clear balance cache: ${response.statusText}`);
  }
}
