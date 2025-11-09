/**
 * Client-side API service for fetching cached data from the server
 */

import type { NetworkBalance } from "../types/balance";

/**
 * Retry a fetch request with exponential backoff
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on abort errors from user cancellation
      if (lastError.name === "AbortError" && attempt === 0) {
        throw new Error("Request timed out after 30 seconds");
      }

      // Only retry on network errors, not on HTTP errors
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Request failed after ${maxRetries} attempts: ${lastError?.message || "Unknown error"}`
  );
}

/**
 * Parse error response body
 */
async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.error || response.statusText;
  } catch {
    return response.statusText;
  }
}

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

  const response = await fetchWithRetry(url);

  if (!response.ok) {
    const errorMessage = await getErrorMessage(response);
    throw new Error(`Failed to fetch prices: ${errorMessage}`);
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

  const response = await fetchWithRetry(url);

  if (!response.ok) {
    const errorMessage = await getErrorMessage(response);
    throw new Error(`Failed to fetch balances: ${errorMessage}`);
  }

  return response.json();
}

/**
 * Fetch cache statistics from server
 */
export async function fetchCacheStats(): Promise<CacheStatsResponse> {
  const response = await fetchWithRetry("/api/cache-stats");

  if (!response.ok) {
    const errorMessage = await getErrorMessage(response);
    throw new Error(`Failed to fetch cache stats: ${errorMessage}`);
  }

  return response.json();
}

/**
 * Clear price cache on server
 */
export async function clearPriceCache(): Promise<void> {
  const response = await fetchWithRetry("/api/cache-stats?action=clear&type=prices", {
    method: "POST",
  });

  if (!response.ok) {
    const errorMessage = await getErrorMessage(response);
    throw new Error(`Failed to clear price cache: ${errorMessage}`);
  }
}

/**
 * Clear balance cache on server for a specific address or all addresses
 */
export async function clearBalanceCache(address?: string): Promise<void> {
  const url = address
    ? `/api/cache-stats?action=clear&type=balances&address=${address}`
    : "/api/cache-stats?action=clear&type=balances";

  const response = await fetchWithRetry(url, {
    method: "POST",
  });

  if (!response.ok) {
    const errorMessage = await getErrorMessage(response);
    throw new Error(`Failed to clear balance cache: ${errorMessage}`);
  }
}
